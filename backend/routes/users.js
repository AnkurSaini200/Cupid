// User Routes
const express = require('express');
const router = express.Router();
const { User, Match } = require('../models');
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });

// Get nearby users (Simulated by getting all other users for now)
router.get('/nearby', async (req, res) => {
    try {
        const { userId } = req.query;

        // Exclude current user and find others
        // real app would use $near with coordinates
        const nearbyUsers = await User.find({ _id: { $ne: userId } })
            .select('-password')
            .limit(20);

        // Transform for frontend if needed (mapping _id to id handled by frontend usually, but let's be safe)
        const formattedUsers = nearbyUsers.map(u => ({
            id: u._id,
            name: u.name,
            age: u.age,
            location: u.location,
            distance: Math.floor(Math.random() * 10) + 1, // Mock distance
            bio: u.bio,
            interests: u.interests,
            verified: false,
            online: u.online,
            image: u.avatar
        }));

        res.json({
            success: true,
            data: formattedUsers,
            count: formattedUsers.length
        });

    } catch (error) {
        console.error('Nearby users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch nearby users'
        });
    }
});

// Get user profile
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get stats (mock for now or count)
        const friendsCount = await Match.countDocuments({ users: userId });

        const profile = {
            id: user._id,
            name: user.name,
            age: user.age,
            location: user.location,
            bio: user.bio,
            interests: user.interests,
            verified: false,
            online: user.online,
            photos: user.photos || [],
            socials: user.socials || {},
            stats: {
                friends: friendsCount,
                communities: 0,
                posts: 0
            },
            avatar: user.avatar
        };

        res.json({
            success: true,
            data: profile
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Failed to fetch profile' });
    }
});

// Update user profile
router.put('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body;

        const allowedFields = ['name', 'bio', 'location', 'interests', 'age', 'socials', 'avatar'];
        const updateData = {};

        for (let field of allowedFields) {
            if (updates[field] !== undefined) {
                updateData[field] = updates[field];
            }
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                ...user.toObject(),
                id: user._id
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Failed to update profile' });
    }
});

// Upload profile photo
router.post('/:userId/photos', upload.single('photo'), async (req, res) => {
    try {
        const { userId } = req.params;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const photoUrl = req.file.path;

        const user = await User.findByIdAndUpdate(
            userId,
            { $push: { photos: photoUrl } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            success: true,
            message: 'Photo uploaded successfully',
            data: { photoUrl }
        });

    } catch (error) {
        console.error('Upload photo error:', error);
        res.status(500).json({ message: 'Failed to upload photo' });
    }
});

// Delete photo
router.delete('/:userId/photos', async (req, res) => {
    try {
        const { userId } = req.params;
        const { photoUrl } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.photos = user.photos.filter(p => p !== photoUrl);

        // If avatar matches deleted photo, reset avatar (optional, but good UX)
        if (user.avatar === photoUrl) {
            user.avatar = 'https://i.pravatar.cc/150?u=' + user._id;
        }

        await user.save();

        res.json({ success: true, message: 'Photo deleted', data: user });
    } catch (error) {
        console.error('Delete photo error:', error);
        res.status(500).json({ message: 'Failed to delete photo' });
    }
});

module.exports = router;
