// HMU (Explore) Routes
const express = require('express');
const router = express.Router();
const { HMUPost, User } = require('../models');

// Get HMU posts feed
router.get('/feed', async (req, res) => {
    try {
        const { limit = 20 } = req.query;

        // Fetch active posts, sorted by newest
        const posts = await HMUPost.find() // active: true filter later if Soft Delete implemented
            .populate('userId', 'name avatar')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        // Transform
        const formattedPosts = posts.map(post => ({
            id: post._id,
            userId: post.userId._id,
            userName: post.userId.name,
            userAvatar: post.userId.avatar,
            activity: post.activity,
            activityEmoji: getActivityEmoji(post.activity),
            text: post.text,
            time: post.createdAt,
            location: post.location,
            responses: post.responses.length,
            isInterested: false // Populate if user logged in sent as param
        }));

        res.json({
            success: true,
            data: formattedPosts,
            count: formattedPosts.length
        });

    } catch (error) {
        console.error('HMU feed error:', error);
        res.status(500).json({ message: 'Failed to fetch HMU posts' });
    }
});

function getActivityEmoji(activity) {
    const map = {
        'coffee': '☕',
        'food': '🍔',
        'drinks': '🍹',
        'study': '📚',
        'gym': '💪',
        'workout': '💪',
        'gaming': '🎮',
        'movie': '🎬',
        'walk': '🚶',
        'hike': '🥾'
    };
    return map[activity.toLowerCase()] || '📅';
}

// Create HMU post
router.post('/create', async (req, res) => {
    try {
        const { userId, activity, text, scheduledTime, location } = req.body;

        if (!activity || !text) {
            return res.status(400).json({ message: 'Activity and text are required' });
        }

        const newPost = new HMUPost({
            userId,
            activity,
            text,
            scheduledTime,
            location
        });

        await newPost.save();

        // Populate user for instant frontend display
        await newPost.populate('userId', 'name avatar');

        res.status(201).json({
            success: true,
            message: 'HMU post created',
            data: {
                id: newPost._id,
                userId: newPost.userId._id,
                userName: newPost.userId.name,
                userAvatar: newPost.userId.avatar,
                activity: newPost.activity,
                activityEmoji: getActivityEmoji(newPost.activity),
                text: newPost.text,
                time: newPost.createdAt,
                location: newPost.location,
                responses: 0
            }
        });

    } catch (error) {
        console.error('Create HMU error:', error);
        res.status(500).json({ message: 'Failed to create HMU post' });
    }
});

// Respond to HMU post
router.post('/:postId/respond', async (req, res) => {
    try {
        const { postId } = req.params;
        const { userId, message } = req.body;

        const post = await HMUPost.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        post.responses.push({
            userId,
            message: message || "I'm interested!",
            createdAt: new Date()
        });

        await post.save();

        res.status(201).json({
            success: true,
            message: 'Response sent'
        });

    } catch (error) {
        res.status(500).json({ message: 'Failed to respond' });
    }
});

// Get user's HMU posts
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const posts = await HMUPost.find({ userId })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: posts,
            count: posts.length
        });

    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch user posts' });
    }
});

// Delete HMU post
router.delete('/:postId', async (req, res) => {
    try {
        const { postId } = req.params;
        // In real app check ownership via req.user from auth middleware

        const result = await HMUPost.findByIdAndDelete(postId);
        if (!result) return res.status(404).json({ message: 'Post not found' });

        res.json({ success: true, message: 'Post deleted' });

    } catch (error) {
        res.status(500).json({ message: 'Failed to delete post' });
    }
});

module.exports = router;
