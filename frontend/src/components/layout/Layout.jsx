import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';

const Layout = () => {
    return (
        <div className="min-h-screen gradient-primary">
            <Navbar />

            {/* Main Content Area */}
            <main className="pt-20 md:pt-24 pb-20 md:pb-10 px-4 max-w-7xl mx-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default Layout;
