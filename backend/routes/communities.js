// Community Routes
const express = require('express');
const router = express.Router();
const { Community, User, Message } = require('../models');

// Get all communities
router.get('/', async (req, res) => {
    try {
        const { search, category, limit = 20 } = req.query;

        let query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        if (category && category !== 'All') {
            query.category = category;
        }

        const communities = await Community.find(query).limit(parseInt(limit));

        // Transform
        const data = communities.map(c => ({
            id: c._id,
            name: c.name,
            icon: c.icon,
            category: c.category,
            description: c.description,
            members: c.members.length,
            cover: c.cover,
            createdAt: c.createdAt
        }));

        res.json({
            success: true,
            data,
            count: data.length
        });

    } catch (error) {
        console.error('Communities error:', error);
        res.status(500).json({ message: 'Failed to fetch communities' });
    }
});

// Join community
router.post('/:communityId/join', async (req, res) => {
    try {
        const { communityId } = req.params;
        const { userId } = req.body;

        const community = await Community.findById(communityId);
        if (!community) return res.status(404).json({ message: 'Community not found' });

        // Check if member
        const isMember = community.members.some(m => m.userId.toString() === userId);
        if (isMember) return res.status(400).json({ message: 'Already a member' });

        community.members.push({ userId });
        await community.save();

        res.status(201).json({ success: true, message: 'Joined community' });

    } catch (error) {
        res.status(500).json({ message: 'Failed to join' });
    }
});

// Leave community
router.post('/:communityId/leave', async (req, res) => {
    try {
        const { communityId } = req.params;
        const { userId } = req.body;

        const community = await Community.findById(communityId);
        if (!community) return res.status(404).json({ message: 'Community not found' });

        community.members = community.members.filter(m => m.userId.toString() !== userId);
        await community.save();

        res.json({ success: true, message: 'Left community' });

    } catch (error) {
        res.status(500).json({ message: 'Failed to leave' });
    }
});

// Get community messages
router.get('/:communityId/messages', async (req, res) => {
    try {
        const { communityId } = req.params;
        const messages = await Message.find({ communityId })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('senderId', 'name avatar');

        res.json({ success: true, data: messages.reverse() });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
});

// Send community message
router.post('/:communityId/messages', async (req, res) => {
    try {
        const { communityId } = req.params;
        const { senderId, text } = req.body;

        const message = await Message.create({
            communityId,
            senderId,
            text
        });

        const populatedMessage = await message.populate('senderId', 'name avatar');

        const io = req.app.get('io');
        if (io) {
            io.to(`community_${communityId}`).emit('new-community-message', populatedMessage);
        }

        res.status(201).json({ success: true, data: populatedMessage });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to send message' });
    }
});

module.exports = router;
