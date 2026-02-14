// Match Routes
const express = require('express');
const router = express.Router();
const { Match, Swipe, User } = require('../models');

// Swipe on user
router.post('/swipe', async (req, res) => {
    try {
        const { userId, targetUserId, direction } = req.body;

        if (!['left', 'right', 'super'].includes(direction)) {
            return res.status(400).json({ message: 'Invalid swipe direction' });
        }

        // Record swipe
        const swipe = new Swipe({
            userId,
            targetUserId,
            direction
        });
        await swipe.save();

        let isMatch = false;

        // Check for match (if right/super swipe)
        if (direction === 'right' || direction === 'super') {
            const reverseSwipe = await Swipe.findOne({
                userId: targetUserId,
                targetUserId: userId,
                direction: { $in: ['right', 'super'] }
            });

            if (reverseSwipe) {
                isMatch = true;
                // Create match
                const match = new Match({
                    users: [userId, targetUserId]
                });
                await match.save();
            }
        }

        res.json({
            success: true,
            data: {
                swiped: true,
                isMatch,
                direction
            }
        });

    } catch (error) {
        console.error('Swipe error:', error);
        res.status(500).json({ message: 'Swipe failed' });
    }
});

// Get user's matches
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Find matches containing this user
        const matches = await Match.find({ users: userId })
            .populate('users', 'name avatar online')
            .sort({ createdAt: -1 });

        // Transform for frontend
        // Transform for frontend
        const userMatches = matches.map(match => {
            if (!match.users) return null;
            const otherUser = match.users.find(u => u && u._id.toString() !== userId);

            if (!otherUser) return null;

            return {
                matchId: match._id,
                user: {
                    id: otherUser._id,
                    name: otherUser.name,
                    avatar: otherUser.avatar,
                    online: otherUser.online,
                    lastMessage: null // Populate later if needed
                },
                matchedAt: match.createdAt
            };
        }).filter(Boolean);

        res.json({
            success: true,
            data: userMatches,
            count: userMatches.length
        });

    } catch (error) {
        console.error('Get matches error:', error);
        res.status(500).json({ message: 'Failed to fetch matches' });
    }
});

module.exports = router;
