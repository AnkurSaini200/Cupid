import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaComment, FaSpinner, FaTimes, FaPaperPlane, FaMapMarkerAlt } from 'react-icons/fa';
import * as hmuApi from '../api/hmu';
import { useApp } from '../context/AppContext';

const HMU = () => {
    const { currentUser, socket } = useApp();
    const [posts, setPosts] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null); // For Chat Modal
    const [chatMessage, setChatMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [newPost, setNewPost] = useState({
        activity: '',
        text: '',
        location: ''
    });

    // Auto-scroll to bottom of chat
    const chatEndRef = useRef(null);

    useEffect(() => {
        loadPosts();
    }, []);

    // Socket Listener for new messages
    useEffect(() => {
        if (!socket) return;

        const handleNewResponse = (response) => {
            if (selectedPost && selectedPost.id === response.hmuPostId) { // Backend might not send hmuPostId, check logic
                // Actually backend emits to room, so we just trust it if we are in the room
                setSelectedPost(prev => ({
                    ...prev,
                    responses: [...prev.responses, response]
                }));
                // Also update the main feed count if visible
                setPosts(prevPosts => prevPosts.map(p =>
                    p.id === selectedPost.id
                        ? { ...p, responses: (p.responses || 0) + 1 }
                        : p
                ));
            }
        };

        // My listener logic above was slightly slightly off, let's fix it:
        // The socket event 'hmu-new-response' sends the message object. 
        // Since we join unique rooms, we don't strictly need to check ID if we assume we only get events for joined rooms.
        socket.on('hmu-new-response', (newMsg) => {
            setSelectedPost(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    responses: [...prev.responses, newMsg]
                };
            });
        });

        return () => {
            socket.off('hmu-new-response');
        };
    }, [socket, selectedPost]);

    // Scroll to bottom when messages change
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedPost?.responses]);

    const loadPosts = async () => {
        try {
            const data = await hmuApi.getFeed();
            setPosts(data.data || []);
            setIsLoading(false);
        } catch (error) {
            console.error('Failed to load HMU posts:', error);
            setIsLoading(false);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        try {
            const postData = {
                ...newPost,
                userId: currentUser.id, // FIX: Pass userId
                location: { name: newPost.location }
            };
            await hmuApi.createPost(postData);
            setShowCreateModal(false);
            setNewPost({ activity: '', text: '', location: '' });
            loadPosts();
        } catch (error) {
            console.error('Failed to create post:', error);
        }
    };

    const handleOpenChat = async (post) => {
        try {
            // Optimistically set selected post with basic info
            setSelectedPost({ ...post, responses: [] });

            // Join Socket Room
            if (socket) socket.emit('join-hmu', post.id);

            // Fetch full details (messages)
            const data = await hmuApi.getPost(post.id);
            if (data.success) {
                setSelectedPost(data.data);
            }
        } catch (error) {
            console.error('Failed to open chat:', error);
        }
    };

    const handleCloseChat = () => {
        if (selectedPost && socket) {
            socket.emit('leave-hmu', selectedPost.id);
        }
        setSelectedPost(null);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!chatMessage.trim() || !selectedPost) return;

        try {
            // API call - Backend will emit socket event
            await hmuApi.respondToPost(selectedPost.id, chatMessage);
            setChatMessage('');
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleDeletePost = async (e, postId) => {
        e.stopPropagation(); // Prevent opening chat
        if (!window.confirm("Are you sure you want to delete this activity?")) return;

        try {
            await hmuApi.deletePost(postId);
            setPosts(posts.filter(p => p.id !== postId));
            if (selectedPost?.id === postId) setSelectedPost(null);
        } catch (error) {
            console.error("Failed to delete post:", error);
            alert("Failed to delete post.");
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
        <div className="max-w-3xl mx-auto pb-20">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-white rounded-2xl p-6 mb-6 flex justify-between items-center"
            >
                <h1 className="text-3xl font-display font-bold gradient-text">
                    Explore
                </h1>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl shadow-lg font-semibold"
                >
                    <FaPlus />
                    <span>Create Post</span>
                </motion.button>
            </motion.div>

            {/* Posts Feed */}
            <div className="space-y-4">
                {posts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        No HMU posts yet. Be the first to start an activity!
                    </div>
                ) : (
                    posts.map((post, index) => (
                        <motion.div
                            key={post.id || post._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -4 }}
                            onClick={() => handleOpenChat(post)}
                            className="glass-white rounded-2xl p-6 cursor-pointer card-hover relative group"
                        >
                            {/* Delete Button (Only for creator) */}
                            {currentUser && post.userId === currentUser.id && (
                                <button
                                    onClick={(e) => handleDeletePost(e, post.id)}
                                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                    title="Delete Activity"
                                >
                                    <FaTimes />
                                </button>
                            )}

                            {/* Post Header */}
                            <div className="flex items-start space-x-4 mb-4">
                                <img
                                    src={post.userAvatar || `https://i.pravatar.cc/150?u=${post.userId}`}
                                    alt={post.userName}
                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-200"
                                />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{post.userName}</h3>
                                    <p className="text-sm text-gray-500">
                                        {new Date(post.time || post.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>

                            {/* Post Content */}
                            <div className="mb-4">
                                <span className="inline-block px-3 py-1 bg-gradient-to-r from-primary-100 to-accent-100 text-primary-700 rounded-full text-sm font-medium mb-3">
                                    {post.activityEmoji} {post.activity}
                                </span>
                                <p className="text-gray-700 leading-relaxed">{post.text}</p>
                                {post.location?.name && (
                                    <p className="text-sm text-gray-500 mt-2 flex items-center">
                                        <FaMapMarkerAlt className="mr-1" />
                                        {post.location.name}
                                    </p>
                                )}
                            </div>

                            {/* Post Footer */}
                            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-sm text-gray-500">
                                    {post.responses || 0} people interested
                                </span>
                                <button className="text-primary-600 font-medium hover:text-primary-700">
                                    Join Chat &rarr;
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Create Post Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-white w-full max-w-lg rounded-3xl p-8 relative"
                        >
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes className="text-xl" />
                            </button>

                            <h2 className="text-2xl font-bold font-display gradient-text mb-6">New Activity</h2>

                            <form onSubmit={handleCreatePost} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Coffee, Hiking, Gaming"
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary-500 focus:outline-none"
                                        value={newPost.activity}
                                        onChange={e => setNewPost({ ...newPost, activity: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                                    <textarea
                                        placeholder="Describe what you want to do..."
                                        rows="3"
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary-500 focus:outline-none resize-none"
                                        value={newPost.text}
                                        onChange={e => setNewPost({ ...newPost, text: e.target.value })}
                                        required
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="Where at?"
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-primary-500 focus:outline-none"
                                        value={newPost.location}
                                        onChange={e => setNewPost({ ...newPost, location: e.target.value })}
                                    />
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    className="w-full py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-bold shadow-lg mt-4"
                                >
                                    Post Activity
                                </motion.button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Chat Modal */}
            <AnimatePresence>
                {selectedPost && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-2xl h-[600px] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                        >
                            {/* Chat Header */}
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl">{selectedPost.activityEmoji}</span>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{selectedPost.activity}</h3>
                                        <p className="text-xs text-gray-500">Hosted by {selectedPost.userName}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCloseChat}
                                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                >
                                    <FaTimes className="text-gray-500" />
                                </button>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                                {/* Initial Post as a message */}
                                <div className="flex space-x-3">
                                    <img src={selectedPost.userAvatar} className="w-8 h-8 rounded-full mt-1" alt={selectedPost.userName} />
                                    <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 max-w-[80%]">
                                        <p className="font-bold text-xs text-primary-600 mb-1">{selectedPost.userName}</p>
                                        <p className="text-gray-800">{selectedPost.text}</p>
                                        {selectedPost.location?.name && (
                                            <p className="text-xs text-gray-400 mt-2 flex items-center"><FaMapMarkerAlt className="mr-1" /> {selectedPost.location.name}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Responses */}
                                {selectedPost.responses?.map((msg) => {
                                    const isMe = msg.userId === currentUser.id;
                                    return (
                                        <div key={msg.id || Math.random()} className={`flex space-x-3 ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                            {!isMe && (
                                                <img
                                                    src={msg.userAvatar || `https://i.pravatar.cc/150?u=${msg.userId}`}
                                                    className="w-8 h-8 rounded-full mt-1"
                                                    alt={msg.userName}
                                                />
                                            )}
                                            <div className={`p-3 rounded-2xl shadow-sm max-w-[70%] ${isMe
                                                ? 'bg-primary-500 text-white rounded-tr-none'
                                                : 'bg-white border border-gray-100 rounded-tl-none'
                                                }`}>
                                                {!isMe && <p className="font-bold text-xs text-primary-600 mb-1">{msg.userName}</p>}
                                                <p className={isMe ? 'text-white' : 'text-gray-800'}>{msg.message}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Chat Input */}
                            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100">
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        placeholder="Join the conversation..."
                                        className="flex-1 px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                                        value={chatMessage}
                                        onChange={(e) => setChatMessage(e.target.value)}
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        type="submit"
                                        disabled={!chatMessage.trim()}
                                        className="px-4 py-3 bg-primary-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FaPaperPlane />
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HMU;
