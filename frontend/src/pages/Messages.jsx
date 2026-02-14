import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaPhone, FaVideo, FaPaperPlane, FaCircle, FaSpinner } from 'react-icons/fa';
import { useApp } from '../context/AppContext';
import * as messagesApi from '../api/messages';
import * as matchesApi from '../api/matches';

const Messages = () => {
    const { currentUser, socket } = useApp();
    const [conversations, setConversations] = useState([]);
    const [matches, setMatches] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState({});
    const [messageInput, setMessageInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef(null);

    // Load conversations on mount
    useEffect(() => {
        loadConversations();
        loadMatches();
    }, [currentUser]);

    // Listen for incoming messages via Socket.IO
    useEffect(() => {
        if (!socket) return;

        socket.on('new-message', (newMessage) => {
            // Update messages if conversation is open
            if (selectedConversation && (selectedConversation.userId === newMessage.senderId || selectedConversation.userId === newMessage.recipientId)) {
                setMessages(prev => ({
                    ...prev,
                    [selectedConversation.userId]: [...(prev[selectedConversation.userId] || []), newMessage]
                }));
                scrollToBottom();
            }

            // Update conversation list (e.g., move to top, update last message)
            loadConversations();
        });

        return () => {
            socket.off('new-message');
        };
    }, [socket, selectedConversation]);

    const loadConversations = async () => {
        try {
            const data = await messagesApi.getConversations(currentUser.id);
            setConversations(data.data || []);
            setIsLoading(false);
        } catch (error) {
            console.error('Failed to load conversations:', error);
            setIsLoading(false);
        }
    };

    const loadMatches = async () => {
        try {
            const data = await matchesApi.getMatches(currentUser.id);
            if (data.success) {
                setMatches(data.data || []);
            }
        } catch (error) {
            console.error('Failed to load matches:', error);
        }
    };

    const startConversationWithMatch = (match) => {
        // Check if conversation already exists
        const existingConv = conversations.find(c => c.otherUser.id === match.user.id);
        if (existingConv) {
            selectConversation(existingConv);
        } else {
            // Create temporary conversation object for UI
            const tempConv = {
                userId: match.user.id,
                userName: match.user.name,
                userAvatar: match.user.avatar,
                online: match.user.online,
                isNew: true
            };
            setSelectedConversation(tempConv);
            setMessages(prev => ({ ...prev, [match.user.id]: [] }));
        }
    };

    const loadMessages = async (userId) => {
        if (!messages[userId]) {
            try {
                // Find conversation ID if possible, otherwise use userId mock flow or search
                // For now assuming we can fetch by userId or just fetch all for a conv
                const conv = conversations.find(c => c.userId === userId);
                if (conv) {
                    const data = await messagesApi.getMessages(conv.id);
                    setMessages(prev => ({ ...prev, [userId]: data.data || [] }));
                }
            } catch (error) {
                console.error('Failed to load messages:', error);
            }
        }
    };

    const selectConversation = (conv) => {
        setSelectedConversation(conv);
        loadMessages(conv.userId);
        setTimeout(scrollToBottom, 100);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const sendMessage = async () => {
        if (!messageInput.trim() || !selectedConversation) return;

        const text = messageInput;
        setMessageInput(''); // Optimistic clear

        try {
            const newMessage = await messagesApi.sendMessage({
                senderId: currentUser.id,
                recipientId: selectedConversation.userId,
                text: text
            });

            // Optimistic update
            setMessages(prev => ({
                ...prev,
                [selectedConversation.userId]: [
                    ...(prev[selectedConversation.userId] || []),
                    newMessage.data
                ]
            }));

            scrollToBottom();
            loadConversations(); // Refresh list to show latest message

        } catch (error) {
            console.error('Failed to send message:', error);
            // Handle error (maybe restore input)
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-180px)]">
                <FaSpinner className="text-4xl text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto h-[calc(100vh-180px)]">
            <div className="glass-white rounded-2xl overflow-hidden shadow-lg h-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
                {/* Conversations List */}
                <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} border-r border-gray-200 flex-col h-full col-span-1`}>
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-2xl font-display font-bold gradient-text mb-4">
                            Messages
                        </h2>

                        {/* Search */}
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                            <input
                                type="text"
                                placeholder="Search messages..."
                                className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500"
                            />
                        </div>
                    </div>

                    {/* Matches Section */}
                    {matches.length > 0 && (
                        <div className="px-6 py-4 border-b border-gray-200 overflow-x-auto">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                New Matches
                            </h3>
                            <div className="flex space-x-4">
                                {matches.map((match) => (
                                    <div
                                        key={match.user.id}
                                        onClick={() => startConversationWithMatch(match)}
                                        className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
                                    >
                                        <div className="relative">
                                            <img
                                                src={match.user.avatar || `https://i.pravatar.cc/150?u=${match.user.id}`}
                                                alt={match.user.name}
                                                className="w-14 h-14 rounded-full object-cover border-2 border-primary-500 p-0.5 group-hover:scale-105 transition-transform"
                                            />
                                            {match.user.online && (
                                                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                                            )}
                                        </div>
                                        <span className="text-xs font-medium text-gray-700 mt-1 truncate w-16 text-center">
                                            {match.user.name.split(' ')[0]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Conversation Items */}
                    <div className="flex-1 overflow-y-auto">
                        {conversations.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                No conversations yet. Go swipe some people!
                            </div>
                        ) : (
                            conversations.map((conv) => (
                                <motion.div
                                    key={conv.id || conv.userId}
                                    whileHover={{ backgroundColor: '#f9fafb' }}
                                    onClick={() => selectConversation(conv)}
                                    className={`p-4 cursor-pointer border-l-4 transition-all ${selectedConversation?.id === conv.id
                                        ? 'border-primary-500 bg-primary-50'
                                        : 'border-transparent'
                                        }`}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="relative">
                                            <img
                                                src={conv.userAvatar || `https://i.pravatar.cc/150?u=${conv.userId}`}
                                                alt={conv.userName}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                            {conv.online && (
                                                <FaCircle className="absolute bottom-0 right-0 text-green-500 text-xs bg-white rounded-full" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-semibold text-gray-900 truncate">
                                                    {conv.userName}
                                                </h3>
                                                <span className="text-xs text-gray-500">
                                                    {conv.updatedAt ? new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 truncate">{conv.lastMessage?.text || 'Start chatting!'}</p>
                                        </div>

                                        {conv.unreadCount > 0 && (
                                            <span className="bg-primary-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={`${!selectedConversation ? 'hidden md:flex' : 'flex'} md:col-span-2 lg:col-span-3 flex-col h-full bg-white md:bg-transparent`}>
                    {selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 md:p-6 border-b border-gray-200 flex justify-between items-center bg-white md:bg-transparent">
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => setSelectedConversation(null)}
                                        className="md:hidden text-gray-500 hover:text-gray-700"
                                    >
                                        &larr;
                                    </button>
                                    <img
                                        src={selectedConversation.userAvatar || `https://i.pravatar.cc/150?u=${selectedConversation.userId}`}
                                        alt={selectedConversation.userName}
                                        className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {selectedConversation.userName}
                                        </h3>
                                        <p className="text-xs md:text-sm text-green-500">
                                            {selectedConversation.online ? 'Online' : 'Offline'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex space-x-2">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-primary-500 hover:bg-primary-100 transition-colors"
                                    >
                                        <FaPhone />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-primary-500 hover:bg-primary-100 transition-colors"
                                    >
                                        <FaVideo />
                                    </motion.button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 space-y-4">
                                {(messages[selectedConversation.userId] || []).map((msg) => (
                                    <motion.div
                                        key={msg.id || msg._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`flex items-end space-x-2 max-w-[85%] md:max-w-md ${msg.senderId === currentUser.id ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                            <img
                                                src={msg.senderId === currentUser.id ? currentUser.avatar : (selectedConversation.userAvatar || `https://i.pravatar.cc/150?u=${selectedConversation.userId}`)}
                                                alt="Avatar"
                                                className="w-8 h-8 rounded-full hidden md:block"
                                            />
                                            <div>
                                                <div
                                                    className={`px-4 py-2 rounded-2xl ${msg.senderId === currentUser.id
                                                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-br-sm'
                                                        : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
                                                        }`}
                                                >
                                                    {msg.text}
                                                </div>
                                                <span className="text-xs text-gray-500 mt-1 block px-2">
                                                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className="p-4 border-t border-gray-200 bg-white">
                                <div className="flex space-x-3">
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                        placeholder="Type a message..."
                                        className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500"
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={sendMessage}
                                        className="px-6 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                                    >
                                        <FaPaperPlane />
                                    </motion.button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400">
                            <div className="text-center">
                                <FaSearch className="text-6xl mx-auto mb-4 opacity-20" />
                                <p className="text-lg">Select a conversation to start chatting</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messages;
