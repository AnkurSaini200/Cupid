import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaComment } from 'react-icons/fa';
import { mockHMUPosts } from '../data/mockData';

const HMU = () => {
    const [posts, setPosts] = useState(mockHMUPosts);
    const [showCreateModal, setShowCreateModal] = useState(false);

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
                {posts.map((post, index) => (
                    <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -4 }}
                        className="glass-white rounded-2xl p-6 cursor-pointer card-hover"
                    >
                        {/* Post Header */}
                        <div className="flex items-start space-x-4 mb-4">
                            <img
                                src={post.userAvatar}
                                alt={post.userName}
                                className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-200"
                            />
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">{post.userName}</h3>
                                <p className="text-sm text-gray-500">{post.time}</p>
                            </div>
                        </div>

                        {/* Post Content */}
                        <div className="mb-4">
                            <span className="inline-block px-3 py-1 bg-gradient-to-r from-primary-100 to-accent-100 text-primary-700 rounded-full text-sm font-medium mb-3">
                                {post.activity}
                            </span>
                            <p className="text-gray-700 leading-relaxed">{post.text}</p>
                        </div>

                        {/* Post Footer */}
                        <div className="pt-4 border-t border-gray-100">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
                            >
                                <FaComment />
                                <span>I'm interested ({post.responses})</span>
                            </motion.button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default HMU;
