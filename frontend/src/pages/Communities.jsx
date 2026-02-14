import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUsers, FaSearch, FaSpinner, FaArrowLeft, FaPaperPlane } from 'react-icons/fa';
import { io } from 'socket.io-client';
import * as communitiesApi from '../api/communities';
import { useApp } from '../context/AppContext';

const CommunityChat = ({ community, onBack }) => {
    const { currentUser } = useApp();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Socket connection
    useEffect(() => {
        const newSocket = io(import.meta.env.PROD ? window.location.origin : 'http://localhost:3000');
        setSocket(newSocket);

        newSocket.emit('join-community', community.id);

        newSocket.on('new-community-message', (msg) => {
            setMessages(prev => [...prev, msg]);
        });

        return () => {
            newSocket.emit('leave-community', community.id);
            newSocket.disconnect();
        };
    }, [community.id]);

    // Fetch initial messages
    useEffect(() => {
        loadMessages();
    }, [community.id]);

    const loadMessages = async () => {
        try {
            const data = await communitiesApi.getCommunityMessages(community.id);
            if (data.success) {
                setMessages(data.data);
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser) return;

        try {
            const tempId = Date.now();
            const messageData = {
                senderId: currentUser.id,
                text: newMessage.trim()
            };

            await communitiesApi.sendCommunityMessage(community.id, messageData);
            setNewMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
            alert('Failed to send message');
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-2xl shadow-xl overflow-hidden glass-white">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-primary-600 to-accent-600 p-4 flex items-center shadow-md z-10">
                <button
                    onClick={onBack}
                    className="mr-4 text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                >
                    <FaArrowLeft />
                </button>
                <div className="flex items-center">
                    <div className="mr-3 text-3xl">{community.icon}</div>
                    <div>
                        <h2 className="text-white font-bold text-lg">{community.name}</h2>
                        <p className="text-white/80 text-xs">{community.members} members</p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <div className="text-4xl mb-2">💬</div>
                        <p>Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.senderId._id === currentUser?.id || msg.senderId === currentUser?.id;
                        const showAvatar = !isMe && (index === 0 || messages[index - 1].senderId._id !== msg.senderId._id);

                        return (
                            <div
                                key={msg._id || index}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}
                            >
                                {!isMe && (
                                    <div className="w-8 h-8 mr-2 flex-shrink-0">
                                        {showAvatar && (
                                            <img
                                                src={msg.senderId.avatar || 'https://i.pravatar.cc/150'}
                                                alt={msg.senderId.name}
                                                className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                            />
                                        )}
                                    </div>
                                )}

                                <div
                                    className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${isMe
                                        ? 'bg-primary-500 text-white rounded-br-none'
                                        : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                                        }`}
                                >
                                    {!isMe && showAvatar && (
                                        <p className="text-xs text-primary-600 font-bold mb-1">
                                            {msg.senderId.name}
                                        </p>
                                    )}
                                    <p className="text-sm">{msg.text}</p>
                                    <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex items-center gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Message #${community.name}...`}
                    className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                />
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-primary-500 text-white p-3 rounded-full shadow-lg disabled:opacity-50 hover:bg-primary-600 transition-colors"
                >
                    <FaPaperPlane />
                </motion.button>
            </form>
        </div>
    );
};

const Communities = () => {
    const [communities, setCommunities] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCommunity, setSelectedCommunity] = useState(null);

    useEffect(() => {
        loadCommunities();
    }, []);

    const loadCommunities = async () => {
        try {
            const data = await communitiesApi.getCommunities();
            setCommunities(data.data || []);
            setIsLoading(false);
        } catch (error) {
            console.error('Failed to load communities:', error);
            setIsLoading(false);
        }
    };

    const toggleJoin = async (e, id) => {
        e.stopPropagation(); // Prevent opening chat
        const community = communities.find(c => c.id === id);
        try {
            if (community.joined) {
                await communitiesApi.leaveCommunity(id);
            } else {
                await communitiesApi.joinCommunity(id);
            }

            setCommunities(communities.map(c =>
                c.id === id ? {
                    ...c,
                    joined: !c.joined,
                    members: c.joined ? c.members - 1 : c.members + 1
                } : c
            ));
        } catch (error) {
            console.error('Failed to update membership:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[600px]">
                <FaSpinner className="text-4xl text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
                {selectedCommunity ? (
                    <motion.div
                        key="chat"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <CommunityChat
                            community={selectedCommunity}
                            onBack={() => setSelectedCommunity(null)}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                    >
                        {/* Header */}
                        <div className="glass-white rounded-2xl p-6 space-y-4">
                            <h1 className="text-3xl font-display font-bold gradient-text">
                                Explore Communities
                            </h1>
                            <p className="text-gray-600">Join discussions about your favorite topics!</p>

                            {/* Search Bar */}
                            <div className="relative">
                                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search communities..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        {/* Communities Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {communities.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((community, index) => (
                                <motion.div
                                    key={community.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ y: -8 }}
                                    onClick={() => setSelectedCommunity(community)}
                                    className="glass-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                                >
                                    {/* Cover Gradient based on name hash or default */}
                                    <div className={`relative h-32 bg-gradient-to-r from-primary-400 to-accent-400 overflow-hidden`}>
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                                        <div className="absolute bottom-3 left-3 text-5xl transform group-hover:scale-110 transition-transform duration-300">
                                            {community.icon}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 space-y-3">
                                        <div>
                                            <h3 className="text-xl font-display font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                                                {community.name}
                                            </h3>
                                            <p className="text-sm text-gray-500 flex items-center mt-1">
                                                <FaUsers className="mr-1" />
                                                {community.members.toLocaleString()} members
                                            </p>
                                        </div>

                                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                                            {community.description}
                                        </p>

                                        <div className="pt-2">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={(e) => toggleJoin(e, community.id)}
                                                className={`w-full py-2 rounded-lg font-semibold text-sm transition-all ${community.joined
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                                                    }`}
                                            >
                                                {community.joined ? 'Joined' : 'Join Community'}
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Communities;
