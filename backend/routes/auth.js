// Authentication Routes
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, age, location, interests, bio } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email and password are required'
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            age,
            location,
            interests: interests || [],
            bio: bio || '',
            avatar: `https://i.pravatar.cc/150?u=${Date.now()}`, // Default avatar
            online: true,
            lastActive: new Date()
        });

        await newUser.save();

        // Generate token
        const token = jwt.sign(
            { id: newUser._id },
            process.env.JWT_SECRET || 'secret_key', // Fallback for dev
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    avatar: newUser.avatar,
                    socials: newUser.socials
                },
                token
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update online status
        user.online = true;
        user.lastActive = new Date();
        await user.save();

        // Generate token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    location: user.location,
                    interests: user.interests,
                    socials: user.socials,
                    bio: user.bio,
                    photos: user.photos
                },
                token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
});

// Logout
router.post('/logout', async (req, res) => {
    try {
        const { userId } = req.body;

        if (userId) {
            await User.findByIdAndUpdate(userId, {
                online: false,
                lastActive: new Date()
            });
        }

        res.json({
            success: true,
            message: 'Logout successful'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Logout failed',
            error: error.message
        });
    }
});

// Verify Token
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');

        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    location: user.location,
                    interests: user.interests,
                    socials: user.socials,
                    bio: user.bio,
                    photos: user.photos
                }
            }
        });

    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Token verification failed',
            error: error.message
        });
    }
});

module.exports = router;
