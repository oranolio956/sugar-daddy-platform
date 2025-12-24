'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, Send, Video, Phone, Smile, Paperclip, 
  MoreVertical, Search, User, Clock, Check, CheckCheck,
  Heart, Gift, Star, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'video' | 'gift';
  status: 'sent' | 'delivered' | 'read';
  isLiked: boolean;
}

interface Conversation {
  id: string;
  participants: string[];
  lastMessage: Message;
  unreadCount: number;
  isTyping: boolean;
}

interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: Date;
}

const messageTemplates = [
  "Hi there! I'd love to get to know you better. What are you passionate about?",
  "I'm impressed by your profile! What's the most exciting thing you've done recently?",
  "Hello! I'm looking for someone who appreciates the finer things in life. How do you like to spend your weekends?",
  "Your smile is absolutely captivating! What's your idea of a perfect evening?",
  "I'd love to hear more about your interests and what makes you unique!"
];

const gifts = [
  { id: 'rose', name: 'Red Rose', price: 5, emoji: '🌹' },
  { id: 'chocolate', name: 'Fine Chocolate', price: 10, emoji: '🍫' },
  { id: 'wine', name: 'Bottle of Wine', price: 25, emoji: '🍷' },
  { id: 'dinner', name: 'Dinner Date', price: 50, emoji: '🍽️' },
  { id: 'jewelry', name: 'Piece of Jewelry', price: 100, emoji: '💎' }
];

export default function EnhancedMessaging() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showGifts, setShowGifts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Mock data for demonstration
  useEffect(() => {
    const mockConversations: Conversation[] = [
      {
        id: '1',
        participants: ['user1', 'user2'],
        lastMessage: {
          id: '1',
          senderId: 'user2',
          receiverId: 'user1',
          content: 'Hey! How was your day?',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          type: 'text',
          status: 'read',
          isLiked: false
        },
        unreadCount: 0,
        isTyping: false
      },
      {
        id: '2',
        participants: ['user1', 'user3'],
        lastMessage: {
          id: '2',
          senderId: 'user1',
          receiverId: 'user3',
          content: 'I had a great time last night!',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          type: 'text',
          status: 'delivered',
          isLiked: true
        },
        unreadCount: 3,
        isTyping: true
      }
    ];
    
    setConversations(mockConversations);
    setSelectedConversation(mockConversations[0]);
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      // Mock messages for selected conversation
      const mockMessages: Message[] = [
        {
          id: '1',
          senderId: 'user2',
          receiverId: 'user1',
          content: 'Hey! How was your day?',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          type: 'text',
          status: 'read',
          isLiked: false
        },
        {
          id: '2',
          senderId: 'user1',
          receiverId: 'user2',
          content: 'It was great, thanks for asking! How about yours?',
          timestamp: new Date(Date.now() - 1000 * 60 * 25),
          type: 'text',
          status: 'read',
          isLiked: true
        },
        {
          id: '3',
          senderId: 'user2',
          receiverId: 'user1',
          content: 'Pretty good! I was thinking about trying that new restaurant downtown.',
          timestamp: new Date(Date.now() - 1000 * 60 * 20),
          type: 'text',
          status: 'read',
          isLiked: false
        }
      ];
      
      setMessages(mockMessages);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: user?.id || 'user1',
      receiverId: selectedConversation.participants.find(p => p !== user?.id) || 'user2',
      content: newMessage,
      timestamp: new Date(),
      type: 'text',
      status: 'sent',
      isLiked: false
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setShowTemplates(false);

    // Simulate typing indicator
    setSelectedConversation(prev => prev ? { ...prev, isTyping: true } : null);
    
    setTimeout(() => {
      setSelectedConversation(prev => prev ? { ...prev, isTyping: false } : null);
      
      // Simulate reply
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        senderId: selectedConversation.participants.find(p => p !== user?.id) || 'user2',
        receiverId: user?.id || 'user1',
        content: "That sounds wonderful! I'd love to hear more about it.",
        timestamp: new Date(),
        type: 'text',
        status: 'delivered',
        isLiked: false
      };
      
      setMessages(prev => [...prev, reply]);
    }, 2000);
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
    
    if (newMessage.length === 0) {
      setIsTyping(true);
    }
  };

  const handleSendGift = (gift: any) => {
    const message: Message = {
      id: Date.now().toString(),
      senderId: user?.id || 'user1',
      receiverId: selectedConversation?.participants.find(p => p !== user?.id) || 'user2',
      content: `Sent you a ${gift.name}! ${gift.emoji}`,
      timestamp: new Date(),
      type: 'gift',
      status: 'sent',
      isLiked: false
    };

    setMessages(prev => [...prev, message]);
    setShowGifts(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getOtherParticipant = () => {
    if (!selectedConversation || !user) return null;
    const otherId = selectedConversation.participants.find(p => p !== user.id);
    return {
      id: otherId || 'user2',
      name: otherId === 'user2' ? 'Sarah Johnson' : 'Alex Thompson',
      avatar: `https://i.pravatar.cc/150?img=${otherId === 'user2' ? 2 : 3}`,
      isOnline: true,
      lastSeen: new Date()
    };
  };

  const otherUser = getOtherParticipant();

  return (
    <div className="h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <div className="flex h-full">
        {/* Sidebar - Conversations */}
        <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900">Messages</h1>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-gray-300">
                  <Video className="w-4 h-4 mr-2" />
                  Video
                </Button>
                <Button variant="outline" size="sm" className="border-gray-300">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation?.id === conversation.id ? 'bg-gray-50' : ''
                }`}
                onClick={() => setSelectedConversation(conversation)}
              >
                <div className="flex items-center gap-3">
                  <Avatar src={conversation.id === '1' ? 'https://i.pravatar.cc/150?img=2' : 'https://i.pravatar.cc/150?img=3'} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 truncate">
                        {conversation.id === '1' ? 'Sarah Johnson' : 'Alex Thompson'}
                      </h3>
                      {conversation.unreadCount > 0 && (
                        <Badge variant="primary" className="text-xs">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage.content}
                    </p>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <div>{formatTime(conversation.lastMessage.timestamp)}</div>
                    {conversation.isTyping && (
                      <div className="text-green-500">Typing...</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar src={otherUser?.avatar} />
                    <div>
                      <h2 className="font-bold text-gray-900">{otherUser?.name}</h2>
                      <p className="text-sm text-gray-600">
                        {otherUser?.isOnline ? (
                          <span className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Online
                          </span>
                        ) : (
                          `Last seen ${formatTime(otherUser?.lastSeen || new Date())}`
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsVideoCallActive(true)}
                      className="border-gray-300 hover:bg-green-50 hover:text-green-700"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Video Call
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-300">
                      <Phone className="w-4 h-4 mr-2" />
                      Call
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-300">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.senderId === user?.id
                          ? 'bg-gradient-gold text-charcoal-900'
                          : 'bg-white text-gray-900 shadow-md'
                      }`}>
                        {message.type === 'gift' ? (
                          <div className="flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-yellow-500" />
                            <span className="font-medium">{message.content}</span>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm">{message.content}</p>
                            <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
                              <span>{formatTime(message.timestamp)}</span>
                              <div className="flex items-center gap-1">
                                {message.senderId === user?.id && (
                                  <>
                                    <CheckCheck className={`w-3 h-3 ${message.status === 'read' ? 'text-blue-500' : 'text-gray-400'}`} />
                                    <span className="text-xs">{message.status}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  
                  {selectedConversation.isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white px-4 py-2 rounded-2xl shadow-md">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-end gap-3">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTemplates(!showTemplates)}
                      className="border-gray-300"
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowGifts(!showGifts)}
                      className="border-gray-300"
                    >
                      <Gift className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-300">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={handleTyping}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="pr-12"
                    />
                    <Smile className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-gradient-gold text-charcoal-900 hover:shadow-lg"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                {/* Message Templates */}
                {showTemplates && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-3 bg-gray-50 rounded-lg space-y-2"
                  >
                    <p className="text-xs text-gray-600 mb-2">Quick Messages:</p>
                    {messageTemplates.map((template, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setNewMessage(template);
                          setShowTemplates(false);
                        }}
                        className="block w-full text-left text-sm text-gray-700 hover:bg-white rounded px-2 py-1"
                      >
                        {template}
                      </button>
                    ))}
                  </motion.div>
                )}

                {/* Gift Selection */}
                {showGifts && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <p className="text-xs text-gray-600 mb-2">Send a Gift:</p>
                    <div className="grid grid-cols-5 gap-2">
                      {gifts.map((gift) => (
                        <button
                          key={gift.id}
                          onClick={() => handleSendGift(gift)}
                          className="text-center p-2 bg-white rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="text-lg">{gift.emoji}</div>
                          <div className="text-xs text-gray-600">{gift.name}</div>
                          <div className="text-xs font-bold text-green-600">${gift.price}</div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-600">Choose a conversation from the sidebar to start messaging.</p>
              </div>
            </div>
          )}
        </div>

        {/* Video Call Modal */}
        {isVideoCallActive && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Video Call with {otherUser?.name}</h3>
                <p className="text-gray-600 mb-6">Connecting...</p>
                
                <div className="flex gap-4 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setIsVideoCallActive(false)}
                    className="border-red-500 text-red-500 hover:bg-red-50"
                  >
                    End Call
                  </Button>
                  <Button
                    onClick={() => setIsVideoCallActive(false)}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    Accept Call
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}