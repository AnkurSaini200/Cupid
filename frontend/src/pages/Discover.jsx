import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { FaTimes, FaStar, FaHeart, FaMapMarkerAlt, FaCheckCircle, FaSlidersH, FaSpinner } from 'react-icons/fa';
import { useApp } from '../context/AppContext';
import * as usersApi from '../api/users';
import * as matchesApi from '../api/matches';

const Discover = () => {
    const { currentUser, addMatch } = useApp();
    const [users, setUsers] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showMatch, setShowMatch] = useState(false);
    const [matchedUser, setMatchedUser] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (currentUser) {
            loadUsers();
        }
    }, [currentUser]);

    const loadUsers = async () => {
        try {
            setIsLoading(true);
            const data = await usersApi.getNearbyUsers({ userId: currentUser.id });
            setUsers(data.data || []);
            setIsLoading(false);
        } catch (err) {
            console.error('Failed to load users:', err);
            setError('Failed to load nearby users.');
            setIsLoading(false);
        }
    };

    const targetUser = users[currentIndex];

    const handleSwipe = async (direction) => {
        if (!targetUser) return;

        try {
            const result = await matchesApi.swipe(currentUser.id, targetUser.id, direction);

            if (result.data.isMatch) {
                setMatchedUser(targetUser);
                setShowMatch(true);
                addMatch(targetUser); // Update context
                setTimeout(() => setShowMatch(false), 3000);
            }

            // Remove user from stack locally after delay
            setTimeout(() => {
                if (currentIndex < users.length - 1) {
                    setCurrentIndex(currentIndex + 1);
                } else {
                    // No more users
                    setUsers(prev => prev.slice(1)); // Remove first
                    setCurrentIndex(0); // Reset index since we sliced
                }
            }, 300);

        } catch (err) {
            console.error('Swipe failed:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[600px]">
                <FaSpinner className="text-4xl text-primary-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[600px] text-gray-500">
                <p className="mb-4">{error}</p>
                <button
                    onClick={loadUsers}
                    className="px-6 py-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!targetUser && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[600px] text-center p-8">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <FaMapMarkerAlt className="text-4xl text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No More Users Nearby</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                    We've run out of people to show you. Try adjusting your filters or checking back later!
                </p>
                <button
                    onClick={() => { setCurrentIndex(0); loadUsers(); }}
                    className="mt-8 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                    Refresh
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-white rounded-2xl p-6 mb-6"
            >
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-display font-bold gradient-text">
                        Find Friends Nearby
                    </h1>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowFilters(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                        <FaSlidersH />
                        <span className="font-medium">Filters</span>
                    </motion.button>
                </div>
            </motion.div>

            {/* Card Stack */}
            <div className="relative h-[550px] sm:h-[600px] mb-8">
                <AnimatePresence>
                    {targetUser && (
                        <SwipeCard
                            key={targetUser.id}
                            user={targetUser}
                            onSwipe={handleSwipe}
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center space-x-4 sm:space-x-6"
            >
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSwipe('left')}
                    className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                >
                    <FaTimes className="text-xl" />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSwipe('super')}
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 shadow-lg shadow-yellow-400/50 flex items-center justify-center text-white"
                >
                    <FaStar className="text-xl" />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleSwipe('right')}
                    className="w-16 h-16 rounded-full bg-gradient-to-r from-pink-400 to-red-400 shadow-lg shadow-pink-400/50 flex items-center justify-center text-white"
                >
                    <FaHeart className="text-xl" />
                </motion.button>
            </motion.div>

            {/* Match Notification */}
            <AnimatePresence>
                {showMatch && matchedUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{ type: 'spring', duration: 0.6 }}
                            className="glass-white rounded-3xl p-8 max-w-md w-full text-center"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                            >
                                <FaHeart className="text-6xl text-pink-500 mx-auto mb-4" />
                            </motion.div>
                            <h2 className="text-3xl font-display font-bold gradient-text mb-2">
                                It's a Match!
                            </h2>
                            <p className="text-gray-600 mb-6">
                                You and <span className="font-semibold text-primary-600">{matchedUser.name}</span> both want to be friends!
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-full py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-semibold shadow-lg"
                            >
                                Send Message
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Swipe Card Component
const SwipeCard = ({ user, onSwipe }) => {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-30, 30]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

    const handleDragEnd = (event, info) => {
        if (Math.abs(info.offset.x) > 100) {
            onSwipe(info.offset.x > 0 ? 'right' : 'left');
        }
    };

    return (
        <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
            style={{ x, rotate, opacity }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
        >
            <div className="glass-white rounded-3xl overflow-hidden shadow-2xl h-full">
                {/* User Image */}
                <div className="relative h-[60%] overflow-hidden">
                    <img
                        src={user.image || user.avatar || `https://i.pravatar.cc/400?u=${user.id}`}
                        alt={user.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Distance Badge */}
                    <div className="absolute top-4 right-4 flex items-center space-x-1 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                        <FaMapMarkerAlt className="text-primary-500" />
                        <span>{user.distance || '5'} km</span>
                    </div>
                </div>

                {/* User Info */}
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center space-x-2">
                                <h2 className="text-2xl font-display font-bold text-gray-900">
                                    {user.name}, {user.age}
                                </h2>
                                {user.verified && (
                                    <FaCheckCircle className="text-primary-500 text-xl" />
                                )}
                            </div>
                            <p className="text-gray-600 flex items-center mt-1">
                                <FaMapMarkerAlt className="mr-1 text-sm" />
                                {user.location}
                            </p>
                        </div>
                    </div>

                    <p className="text-gray-700 leading-relaxed">{user.bio}</p>

                    <div className="flex flex-wrap gap-2">
                        {user.interests?.map((interest, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-gradient-to-r from-primary-50 to-accent-50 text-primary-700 rounded-full text-sm font-medium"
                            >
                                {interest}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Discover;
