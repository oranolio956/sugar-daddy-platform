import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import axios from 'axios';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({
    service: 'Messaging Service',
    status: 'running',
    version: '1.0.0',
    capabilities: [
      'real_time_chat',
      'video_calling',
      'voice_messages',
      'message_templates',
      'read_receipts',
      'typing_indicators'
    ]
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Get conversations for user
app.get('/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    // Get user's conversations
    const conversations = await getUserConversations(userId, parseInt(limit), parseInt(offset));

    // Add last message and unread count for each conversation
    const enrichedConversations = await Promise.all(
      conversations.map(async (conversation) => {
        const lastMessage = await getLastMessage(conversation.id);
        const unreadCount = await getUnreadCount(conversation.id, userId);

        return {
          ...conversation,
          lastMessage,
          unreadCount
        };
      })
    );

    res.json({
      conversations: enrichedConversations,
      total: conversations.length
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// Create new conversation
app.post('/conversations', async (req, res) => {
  try {
    const { participants, type = 'direct', initialMessage } = req.body;

    // Validate participants
    if (!participants || participants.length < 2) {
      return res.status(400).json({ error: 'At least 2 participants required' });
    }

    // Check if conversation already exists
    const existingConversation = await findExistingConversation(participants);
    if (existingConversation) {
      return res.json(existingConversation);
    }

    // Create new conversation
    const conversation = await createConversation(participants, type);

    // Send initial message if provided
    if (initialMessage) {
      await sendMessage(conversation.id, initialMessage.senderId, initialMessage.content, initialMessage.type);
    }

    // Notify participants via WebSocket
    participants.forEach(participantId => {
      io.to(`user_${participantId}`).emit('new_conversation', {
        conversationId: conversation.id,
        participants: conversation.participants
      });
    });

    res.status(201).json(conversation);
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Get messages for conversation
app.get('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, before } = req.query;

    const messages = await getConversationMessages(conversationId, parseInt(limit), before);

    // Mark messages as read for current user
    const currentUser = (req as any).user;
    if (currentUser) {
      await markMessagesAsRead(conversationId, currentUser.id);
    }

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Send message
app.post('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, type = 'text', metadata } = req.body;
    const senderId = (req as any).user.id;

    // Validate conversation access
    const hasAccess = await validateConversationAccess(conversationId, senderId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check user's messaging credits
    const hasCredits = await checkMessagingCredits(senderId);
    if (!hasCredits) {
      return res.status(403).json({ error: 'Insufficient messaging credits' });
    }

    // Send message
    const message = await sendMessage(conversationId, senderId, content, type, metadata);

    // Deduct credits for non-premium users
    await deductMessagingCredits(senderId);

    // Emit to all conversation participants
    const participants = await getConversationParticipants(conversationId);
    participants.forEach(participantId => {
      if (participantId !== senderId) {
        io.to(`user_${participantId}`).emit('new_message', {
          conversationId,
          message
        });
      }
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark messages as read
app.post('/conversations/:conversationId/messages/read', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { messageIds } = req.body;
    const userId = (req as any).user.id;

    // Validate conversation access
    const hasAccess = await validateConversationAccess(conversationId, userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Mark messages as read
    const result = await markMessagesAsRead(conversationId, userId, messageIds);

    // Emit read receipt to sender
    const participants = await getConversationParticipants(conversationId);
    participants.forEach(participantId => {
      if (participantId !== userId) {
        io.to(`user_${participantId}`).emit('messages_read', {
          conversationId,
          userId,
          messageIds,
          readAt: new Date().toISOString()
        });
      }
    });

    res.json({ success: true, readCount: result.readCount });
  } catch (error) {
    console.error('Mark messages read error:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Send typing indicator
app.post('/conversations/:conversationId/typing', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { isTyping } = req.body;
    const userId = (req as any).user.id;

    // Validate conversation access
    const hasAccess = await validateConversationAccess(conversationId, userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Emit typing indicator to other participants
    const participants = await getConversationParticipants(conversationId);
    participants.forEach(participantId => {
      if (participantId !== userId) {
        io.to(`user_${participantId}`).emit('typing_indicator', {
          conversationId,
          userId,
          isTyping,
          timestamp: new Date().toISOString()
        });
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Typing indicator error:', error);
    res.status(500).json({ error: 'Failed to send typing indicator' });
  }
});

// Get message templates
app.get('/message-templates', async (req, res) => {
  try {
    const { userId } = req.query;
    const templates = await getMessageTemplates(userId as string);

    res.json({ templates });
  } catch (error) {
    console.error('Get message templates error:', error);
    res.status(500).json({ error: 'Failed to get message templates' });
  }
});

// Send message template
app.post('/conversations/:conversationId/templates/:templateId/send', async (req, res) => {
  try {
    const { conversationId, templateId } = req.params;
    const senderId = (req as any).user.id;

    // Validate conversation access
    const hasAccess = await validateConversationAccess(conversationId, senderId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get template and send message
    const template = await getMessageTemplate(templateId);
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const message = await sendMessage(conversationId, senderId, template.text, 'text', {
      templateId,
      templateCategory: template.category
    });

    // Emit to all conversation participants
    const participants = await getConversationParticipants(conversationId);
    participants.forEach(participantId => {
      if (participantId !== senderId) {
        io.to(`user_${participantId}`).emit('new_message', {
          conversationId,
          message
        });
      }
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Send template message error:', error);
    res.status(500).json({ error: 'Failed to send template message' });
  }
});

// Video call endpoints
app.post('/video-calls', async (req, res) => {
  try {
    const { callerId, receiverId, conversationId } = req.body;

    // Check if users have video call permissions
    const hasPermission = await checkVideoCallPermission(callerId);
    if (!hasPermission) {
      return res.status(403).json({ error: 'Video calls require premium subscription' });
    }

    // Check if receiver is available
    const isAvailable = await checkUserAvailability(receiverId);
    if (!isAvailable) {
      return res.status(409).json({ error: 'User is not available for calls' });
    }

    // Create video call session
    const callSession = await createVideoCallSession(callerId, receiverId, conversationId);

    // Notify receiver
    io.to(`user_${receiverId}`).emit('incoming_call', {
      callId: callSession.id,
      callerId,
      conversationId
    });

    // Send push notification
    await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/notifications`, {
      userId: receiverId,
      type: 'video_call',
      title: 'Incoming Video Call',
      body: 'Someone is calling you',
      data: { callId: callSession.id, callerId }
    });

    res.json({
      callId: callSession.id,
      status: 'ringing',
      participants: [callerId, receiverId]
    });
  } catch (error) {
    console.error('Create video call error:', error);
    res.status(500).json({ error: 'Failed to create video call' });
  }
});

// Accept video call
app.post('/video-calls/:callId/accept', async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = (req as any).user.id;

    const callSession = await acceptVideoCall(callId, userId);

    // Notify caller that call was accepted
    io.to(`user_${callSession.callerId}`).emit('call_accepted', {
      callId,
      participantId: userId
    });

    res.json({
      callId,
      status: 'connected',
      webrtcConfig: await generateWebRTCConfig(callId)
    });
  } catch (error) {
    console.error('Accept video call error:', error);
    res.status(500).json({ error: 'Failed to accept video call' });
  }
});

// Reject video call
app.post('/video-calls/:callId/reject', async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = (req as any).user.id;

    await rejectVideoCall(callId, userId);

    // Notify caller
    const callSession = await getCallSession(callId);
    io.to(`user_${callSession.callerId}`).emit('call_rejected', {
      callId,
      participantId: userId
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Reject video call error:', error);
    res.status(500).json({ error: 'Failed to reject video call' });
  }
});

// End video call
app.post('/video-calls/:callId/end', async (req, res) => {
  try {
    const { callId } = req.params;
    const userId = (req as any).user.id;

    const callSession = await endVideoCall(callId, userId);

    // Notify other participants
    callSession.participants.forEach(participantId => {
      if (participantId !== userId) {
        io.to(`user_${participantId}`).emit('call_ended', {
          callId,
          endedBy: userId
        });
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('End video call error:', error);
    res.status(500).json({ error: 'Failed to end video call' });
  }
});

// Get message templates
app.get('/message-templates', async (req, res) => {
  try {
    const templates = [
      {
        id: 'greeting',
        category: 'icebreakers',
        text: 'Hi! I saw we have some things in common. What made you create your profile today?',
        premium: false
      },
      {
        id: 'compliment',
        category: 'icebreakers',
        text: 'I love your profile photo! The [location/activity] in the background caught my eye. Have you been there recently?',
        premium: true
      },
      {
        id: 'question',
        category: 'conversation',
        text: 'What\'s the most interesting thing you\'ve done recently?',
        premium: false
      },
      {
        id: 'luxury',
        category: 'premium',
        text: 'I appreciate someone who understands the finer things in life. What\'s your favorite luxury experience?',
        premium: true
      }
    ];

    res.json({ templates });
  } catch (error) {
    console.error('Get message templates error:', error);
    res.status(500).json({ error: 'Failed to get message templates' });
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('User connected to messaging:', socket.id);

  // Join user's room for targeted messages
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room`);
  });

  // Handle typing indicators
  socket.on('typing_start', (data) => {
    const { conversationId, userId } = data;
    socket.to(`conversation_${conversationId}`).emit('user_typing', {
      userId,
      conversationId
    });
  });

  socket.on('typing_stop', (data) => {
    const { conversationId, userId } = data;
    socket.to(`conversation_${conversationId}`).emit('user_stopped_typing', {
      userId,
      conversationId
    });
  });

  // Handle read receipts
  socket.on('mark_read', async (data) => {
    const { conversationId, userId, messageIds } = data;

    try {
      await markMessagesAsRead(conversationId, userId, messageIds);

      // Notify other participants
      socket.to(`conversation_${conversationId}`).emit('messages_read', {
        conversationId,
        userId,
        messageIds
      });
    } catch (error) {
      console.error('Mark read error:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected from messaging:', socket.id);
  });
});

// Helper functions (mock implementations)

async function getUserConversations(userId: string, limit: number, offset: number) {
  // Mock implementation
  return [
    {
      id: 'conv_1',
      participants: ['user1', 'user2'],
      type: 'match',
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    }
  ];
}

async function getLastMessage(conversationId: string) {
  return {
    id: 'msg_1',
    content: 'Hello!',
    type: 'text',
    senderId: 'user1',
    createdAt: new Date().toISOString()
  };
}

async function getUnreadCount(conversationId: string, userId: string) {
  return Math.floor(Math.random() * 5);
}

async function findExistingConversation(participants: string[]) {
  return null; // Mock: no existing conversation
}

async function createConversation(participants: string[], type: string) {
  const conversationId = `conv_${Date.now()}`;
  return {
    id: conversationId,
    participants,
    type,
    createdAt: new Date().toISOString()
  };
}

async function getConversationMessages(conversationId: string, limit: number, before?: string) {
  return [
    {
      id: 'msg_1',
      conversationId,
      senderId: 'user1',
      content: 'Hi there!',
      type: 'text',
      createdAt: new Date().toISOString(),
      readBy: ['user1']
    }
  ];
}

async function sendMessage(conversationId: string, senderId: string, content: string, type: string = 'text', metadata?: any) {
  return {
    id: `msg_${Date.now()}`,
    conversationId,
    senderId,
    content,
    type,
    metadata,
    createdAt: new Date().toISOString(),
    readBy: [senderId]
  };
}

async function validateConversationAccess(conversationId: string, userId: string) {
  return true; // Mock validation
}

async function checkMessagingCredits(userId: string) {
  return true; // Mock credits check
}

async function deductMessagingCredits(userId: string) {
  // Mock credits deduction
}

async function getConversationParticipants(conversationId: string) {
  return ['user1', 'user2'];
}

async function markMessagesAsRead(conversationId: string, userId: string, messageIds?: string[]) {
  // Mock read marking implementation
  console.log(`Marking messages as read for user ${userId} in conversation ${conversationId}`);
  
  return {
    readCount: messageIds ? messageIds.length : 1
  };
}

// Get message templates for user
async function getMessageTemplates(userId: string) {
  // Mock implementation - would fetch from database based on user preferences
  const baseTemplates = [
    {
      id: 'greeting',
      category: 'icebreakers',
      text: 'Hi! I saw we have some things in common. What made you create your profile today?',
      premium: false,
      usageCount: 0
    },
    {
      id: 'compliment',
      category: 'icebreakers',
      text: 'I love your profile photo! The [location/activity] in the background caught my eye. Have you been there recently?',
      premium: true,
      usageCount: 0
    },
    {
      id: 'question',
      category: 'conversation',
      text: 'What\'s the most interesting thing you\'ve done recently?',
      premium: false,
      usageCount: 0
    },
    {
      id: 'luxury',
      category: 'premium',
      text: 'I appreciate someone who understands the finer things in life. What\'s your favorite luxury experience?',
      premium: true,
      usageCount: 0
    },
    {
      id: 'date_idea',
      category: 'dates',
      text: 'I\'d love to take you to [restaurant/activity]. Have you been there before?',
      premium: true,
      usageCount: 0
    }
  ];

  // Filter templates based on user subscription level
  const userSubscription = await getUserSubscription(userId);
  const filteredTemplates = baseTemplates.filter(template =>
    !template.premium || userSubscription === 'premium' || userSubscription === 'elite' || userSubscription === 'vip'
  );

  return filteredTemplates;
}

// Get specific message template
async function getMessageTemplate(templateId: string) {
  const templates = await getMessageTemplates(''); // Get all templates
  return templates.find(template => template.id === templateId);
}

// Get user subscription level
async function getUserSubscription(userId: string) {
  // Mock implementation - would fetch from user service
  return 'premium'; // Mock premium user
}

async function checkVideoCallPermission(userId: string) {
  return true; // Mock permission check
}

async function checkUserAvailability(userId: string) {
  return Math.random() > 0.3; // Mock availability
}

async function createVideoCallSession(callerId: string, receiverId: string, conversationId: string) {
  return {
    id: `call_${Date.now()}`,
    callerId,
    receiverId,
    conversationId,
    status: 'ringing',
    createdAt: new Date().toISOString()
  };
}

async function acceptVideoCall(callId: string, userId: string) {
  return {
    id: callId,
    callerId: 'caller',
    participants: ['caller', userId]
  };
}

async function rejectVideoCall(callId: string, userId: string) {
  // Mock rejection
}

async function endVideoCall(callId: string, userId: string) {
  return {
    id: callId,
    participants: ['user1', 'user2']
  };
}

async function getCallSession(callId: string) {
  return {
    callerId: 'caller'
  };
}

async function generateWebRTCConfig(callId: string) {
  // Mock WebRTC configuration
  return {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }
    ],
    callId
  };
}

const PORT = process.env.PORT || 3004;
httpServer.listen(PORT, () => {
  console.log(`Messaging Service is running on port ${PORT}`);
});