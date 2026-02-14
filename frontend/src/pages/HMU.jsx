import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaComment, FaSpinner, FaTimes } from 'react-icons/fa';
import * as hmuApi from '../api/hmu';
import { useApp } from '../context/AppContext';

const HMU = () => {
    const { currentUser } = useApp();
    const [posts, setPosts] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [newPost, setNewPost] = useState({
        activity: '',
        text: '',
        location: ''
    });

    useEffect(() => {
        loadPosts();
    }, []);

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
                location: { name: newPost.location } // Simple object structure for now
            };
            await hmuApi.createPost(postData);
            setShowCreateModal(false);
            setNewPost({ activity: '', text: '', location: '' });
            loadPosts(); // Reload feed
        } catch (error) {
            console.error('Failed to create post:', error);
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
        <div className="max-w-3xl mx-auto">
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
                            className="glass-white rounded-2xl p-6 cursor-pointer card-hover"
                        >
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
                                        {new Date(post.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>

                            {/* Post Content */}
                            <div className="mb-4">
                                <span className="inline-block px-3 py-1 bg-gradient-to-r from-primary-100 to-accent-100 text-primary-700 rounded-full text-sm font-medium mb-3">
                                    {post.activity}
                                </span>
                                <p className="text-gray-700 leading-relaxed">{post.text}</p>
                                {post.location?.name && (
                                    <p className="text-sm text-gray-500 mt-2">📍 {post.location.name}</p>
                                )}
                            </div>

                            {/* Post Footer */}
                            <div className="pt-4 border-t border-gray-100">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
                                >
                                    <FaComment />
                                    <span>I'm interested ({post.responses?.length || 0})</span>
                                </motion.button>
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
        </div>
    );
};

export default HMU;
