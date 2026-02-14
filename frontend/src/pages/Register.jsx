import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { FaUser, FaEnvelope, FaLock, FaArrowRight, FaMapMarkerAlt } from 'react-icons/fa';

const Register = () => {
    const { register } = useApp();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        age: '',
        location: '',
        interests: []
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Basic validation
        if (!formData.name || !formData.email || !formData.password) {
            setError('Please fill in all required fields');
            setIsLoading(false);
            return;
        }

        const result = await register({
            ...formData,
            age: parseInt(formData.age) || 18 // Default age if missing
        });

        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-white to-accent-50 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-white p-8 rounded-3xl shadow-xl w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-display font-bold gradient-text mb-2">Create Account</h1>
                    <p className="text-gray-500">Join the community today</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mb-6 p-4 bg-red-50 text-red-500 rounded-xl text-sm"
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <div className="relative">
                            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                required
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <div className="relative">
                            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                required
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                                placeholder="hello@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <div className="relative">
                            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="password"
                                required
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                            <input
                                type="number"
                                min="13"
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                                placeholder="25"
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                            <div className="relative">
                                <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                                    placeholder="City"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isLoading}
                        type="submit"
                        className="w-full mt-4 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 flex items-center justify-center space-x-2 disabled:opacity-70"
                    >
                        <span>{isLoading ? 'Creating Account...' : 'Sign Up'}</span>
                        {!isLoading && <FaArrowRight />}
                    </motion.button>
                </form>

                <p className="mt-8 text-center text-gray-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">
                        Sign In
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
