'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  MessageCircle, 
  Video, 
  Phone, 
  MoreHorizontal, 
  Search, 
  Paperclip, 
  Smile,
  Check,
  CheckCheck,
  Clock,
  TypingIndicator,
  MessageTemplate
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'gift' | 'location';
  createdAt: string;
  readBy: string[];
  metadata?: any;
}

interface Conversation {
  id: string;
  participants: string[];
  type: string;
  lastActivity: string;
  unreadCount: number;
  lastMessage?: Message;
}

interface MessageTemplate {
  id: string;
  category: string;
  text: string;
  premium: boolean;
  usageCount: number;
}

export default function MessagingPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [messageTemplates, setMessageTemplates] = useState<MessageTemplate[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize Socket.IO connection
    const token = localStorage.getItem('auth_token');
    const newSocket = io(process.env.NEXT_PUBLIC_MESSAGING_URL || 'http://localhost:3004', {
      auth: {
        token
      }
    });

    setSocket(newSocket);

    // Join user room
    newSocket.emit('join', getCurrentUserId());

    // Listen for new messages
    newSocket.on('new_message', (data) => {
      if (data.conversationId === selectedConversation?.id) {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
      }
    });

    // Listen for typing indicators
    newSocket.on('typing_indicator', (data) => {
      if (data.conversationId === selectedConversation?.id) {
        if (data.isTyping) {
          setTypingUsers(prev => [...prev, data.userId]);
        } else {
          setTypingUsers(prev => prev.filter(id => id !== data.userId));
        }
      }
    });

    // Listen for read receipts
    newSocket.on('messages_read', (data) => {
      if (data.conversationId === selectedConversation?.id) {
        setMessages(prev => prev.map(msg => 
          data.messageIds.includes(msg.id) 
            ? { ...msg, readBy: [...new Set([...msg.readBy, data.userId])] }
            : msg
        ));
      }
    });

    // Fetch conversations
    fetchConversations();

    return () => {
      newSocket.disconnect();
    };
  }, [selectedConversation]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      fetchMessageTemplates();
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getCurrentUserId = () => {
    // Mock implementation - would get from auth context
    return 'current_user_id';
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch(`/api/conversations/${getCurrentUserId()}`);
      const data = await response.json();
      setConversations(data.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`);
      const data = await response.json();
      setMessages(data.messages);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessageTemplates = async () => {
    try {
      const response = await fetch('/api/message-templates');
      const data = await response.json();
      setMessageTemplates(data.templates);
    } catch (error) {
      console.error('Error fetching message templates:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const messageData = {
      content: newMessage,
      type: 'text' as const
    };

    try {
      const response = await fetch(`/api/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(messageData)
      });

      if (response.ok) {
        setNewMessage('');
        // Socket will handle the message update
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = () => {
    if (!selectedConversation || !socket) return;

    setIsTyping(true);
    
    // Send typing start
    socket.emit('typing_start', {
      conversationId: selectedConversation.id,
      userId: getCurrentUserId()
    });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing stop after delay
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing_stop', {
        conversationId: selectedConversation.id,
        userId: getCurrentUserId()
      });
    }, 2000);
  };

  const sendTemplateMessage = async (template: MessageTemplate) => {
    if (!selectedConversation) return;

    try {
      const response = await fetch(`/api/conversations/${selectedConversation.id}/templates/${template.id}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        setShowTemplates(false);
      }
    } catch (error) {
      console.error('Error sending template message:', error);
    }
  };

  const markMessagesAsRead = async () => {
    if (!selectedConversation || !socket) return;

    const unreadMessageIds = messages
      .filter(msg => !msg.readBy.includes(getCurrentUserId()))
      .map(msg => msg.id);

    if (unreadMessageIds.length === 0) return;

    try {
      await fetch(`/api/conversations/${selectedConversation.id}/messages/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ messageIds: unreadMessageIds })
      });

      // Update local state
      setMessages(prev => prev.map(msg => 
        unreadMessageIds.includes(msg.id)
          ? { ...msg, readBy: [...msg.readBy, getCurrentUserId()] }
          : msg
      ));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getReadStatusIcon = (message: Message) => {
    const isCurrentUser = message.senderId === getCurrentUserId();
    const isRead = message.readBy.includes(getCurrentUserId());
    
    if (!isCurrentUser) return null;

    if (isRead) {
      return <CheckCheck className="h-4 w-4 text-blue-500" />;
    } else {
      return <Check className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Conversations List */}
        <Card className="lg:col-span-1 backdrop-blur-sm bg-white/80 border-none shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-3">
                  <MessageCircle className="h-6 w-6 text-purple-500" />
                  Messages
                </CardTitle>
                <CardDescription>Recent conversations</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="border-purple-200">
                  <Video className="h-4 w-4 mr-2" />
                  Video
                </Button>
                <Button variant="outline" size="sm" className="border-purple-200">
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
              </div>
            </div>
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Search conversations..." 
                className="pl-10 border-gray-300 focus:border-purple-500"
              />
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh]">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation?.id === conversation.id ? 'bg-purple-50' : ''
                  }`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="/placeholder-avatar.jpg" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          Conversation with {conversation.participants.length} users
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.lastMessage?.content || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">
                        {new Date(conversation.lastActivity).toLocaleDateString()}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <Badge className="mt-1 bg-purple-500 text-white">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2 backdrop-blur-sm bg-white/80 border-none shadow-xl">
          {selectedConversation ? (
            <>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder-avatar.jpg" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">Conversation</CardTitle>
                      <CardDescription className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Online</span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setShowTemplates(!showTemplates)}>
                      <MessageTemplate className="h-4 w-4 mr-2" />
                      Templates
                    </Button>
                    <Button variant="outline" size="sm">
                      <Video className="h-4 w-4 mr-2" />
                      Video Call
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex-1 overflow-hidden">
                  <ScrollArea className="h-[50vh] p-4">
                    <AnimatePresence>
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`mb-4 ${
                            message.senderId === getCurrentUserId() ? 'text-right' : 'text-left'
                          }`}
                        >
                          <div className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.senderId === getCurrentUserId() 
                              ? 'bg-purple-500 text-white' 
                              : 'bg-gray-200 text-gray-900'
                          }`}>
                            <p>{message.content}</p>
                            <div className="flex items-center justify-between mt-2 text-xs opacity-75">
                              <span>{formatTime(message.createdAt)}</span>
                              <div className="flex items-center space-x-1">
                                {getReadStatusIcon(message)}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      
                      {/* Typing Indicator */}
                      {typingUsers.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-left mb-4"
                        >
                          <div className="inline-block bg-gray-200 text-gray-900 px-4 py-2 rounded-lg">
                            <div className="flex space-x-2">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                              <span className="text-xs text-gray-500 ml-2">Typing...</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </AnimatePresence>
                  </ScrollArea>
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-end space-x-3">
                    <div className="flex-1">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" className="text-gray-500">
                          <Paperclip className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-500">
                          <Smile className="h-5 w-5" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => {
                          setNewMessage(e.target.value);
                          handleTyping();
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        className="mt-2 border-gray-300 focus:border-purple-500"
                      />
                    </div>
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-full"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="h-[60vh] flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Select a conversation to start messaging</p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Message Templates Sidebar */}
        {showTemplates && (
          <Card className="lg:col-span-1 backdrop-blur-sm bg-white/80 border-none shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <MessageTemplate className="h-6 w-6 text-purple-500" />
                Message Templates
              </CardTitle>
              <CardDescription>Quick messages to start conversations</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[60vh]">
                {messageTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 border border-gray-200 rounded-lg mb-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={template.premium ? "secondary" : "default"}>
                        {template.category}
                      </Badge>
                      {template.premium && (
                        <Badge variant="outline" className="text-purple-600 border-purple-200">
                          Premium
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{template.text}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Used {template.usageCount} times</span>
                      <Button
                        size="sm"
                        onClick={() => sendTemplateMessage(template)}
                        disabled={template.premium} // Mock: only non-premium templates available
                        className="bg-purple-500 hover:bg-purple-600 text-white"
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}