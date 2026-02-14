import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCompass, FaBullhorn, FaUsers, FaComments, FaUser, FaUserFriends } from 'react-icons/fa';

const Navbar = () => {
    const location = useLocation();

    const navItems = [
        { path: '/', icon: FaCompass, label: 'Discover' },
        { path: '/hmu', icon: FaBullhorn, label: 'HMU' },
        { path: '/communities', icon: FaUsers, label: 'Communities' },
        { path: '/messages', icon: FaComments, label: 'Messages', badge: 3 },
        { path: '/profile', icon: FaUser, label: 'Profile' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-white backdrop-blur-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 sm:h-18">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 group">
                        <FaUserFriends className="text-3xl text-primary-500 group-hover:text-primary-600 transition-colors" />
                        <span className="text-xl sm:text-2xl font-display font-bold gradient-text">
                            Cupid
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex space-x-2">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className="relative group"
                                >
                                    <motion.div
                                        whileHover={{ y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`flex flex-col items-center px-4 py-2 rounded-xl transition-all ${isActive
                                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                                            : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        <div className="relative">
                                            <Icon className="text-xl" />
                                            {item.badge && (
                                                <motion.span
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center pulse-ring"
                                                >
                                                    {item.badge}
                                                </motion.span>
                                            )}
                                        </div>
                                        <span className="text-xs font-medium mt-1">{item.label}</span>
                                    </motion.div>

                                    {isActive && (
                                        <motion.div
                                            layoutId="navbar-indicator"
                                            className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                                            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Mobile Navigation */}
                    <div className="md:hidden flex space-x-1">
                        {navItems.slice(0, 3).map((item) => {
                            const isActive = location.pathname === item.path;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className="relative"
                                >
                                    <motion.div
                                        whileTap={{ scale: 0.9 }}
                                        className={`p-2 rounded-lg transition-all ${isActive
                                            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
                                            : 'text-gray-600'
                                            }`}
                                    >
                                        <Icon className="text-lg" />
                                        {item.badge && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                                {item.badge}
                                            </span>
                                        )}
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 glass-white border-t border-gray-200 z-50">
                <div className="flex justify-around items-center h-16 px-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="relative flex-1"
                            >
                                <motion.div
                                    whileTap={{ scale: 0.9 }}
                                    className="flex flex-col items-center"
                                >
                                    <div className="relative">
                                        <Icon
                                            className={`text-xl transition-colors ${isActive ? 'text-primary-500' : 'text-gray-500'
                                                }`}
                                        />
                                        {item.badge && (
                                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                    <span
                                        className={`text-xs mt-1 font-medium ${isActive ? 'text-primary-500' : 'text-gray-500'
                                            }`}
                                    >
                                        {item.label}
                                    </span>
                                </motion.div>

                                {isActive && (
                                    <motion.div
                                        layoutId="mobile-navbar-indicator"
                                        className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
