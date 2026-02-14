// Message Routes
const express = require('express');
const router = express.Router();
const { Message, Conversation, User } = require('../models');

// Get user's conversations
router.get('/conversations/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Find conversations where user is a participant
        const conversations = await Conversation.find({
            participants: userId
        })
            .populate('participants', 'name avatar online')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });

        // Transform for frontend
        const userConversations = await Promise.all(conversations.map(async conv => {
            const otherUser = conv.participants.find(p => p._id.toString() !== userId);

            // If other user deleted/null, handle gracefully
            if (!otherUser) return null;

            // Count unread messages
            const unreadCount = await Message.countDocuments({
                conversationId: conv._id,
                recipientId: userId,
                read: false
            });

            return {
                id: conv._id,
                userId: otherUser._id,
                userName: otherUser.name,
                userAvatar: otherUser.avatar,
                online: otherUser.online,
                lastMessage: conv.lastMessage ? {
                    text: conv.lastMessage.text,
                    timestamp: conv.lastMessage.createdAt,
                    senderId: conv.lastMessage.senderId
                } : null,
                unreadCount: unreadCount
            };
        }));

        const validConversations = userConversations.filter(Boolean);

        res.json({
            success: true,
            data: validConversations,
            count: validConversations.length
        });

    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ message: 'Failed to fetch conversations' });
    }
});

// Get messages in a conversation
router.get('/:conversationId', async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { limit = 50 } = req.query;

        const messages = await Message.find({ conversationId })
            .sort({ createdAt: 1 }) // Check if frontend expects descending or ascending. Usually chat is ascending (oldest top, newest bottom) but standard API often returns newest. Let's return ascending for chat history log.
            // Wait, Message.jsx probably wants history.
            .limit(parseInt(limit));

        // Provide formatted data
        const formattedMessages = messages.map(m => ({
            id: m._id,
            conversationId: m.conversationId,
            senderId: m.senderId,
            text: m.text,
            timestamp: m.createdAt,
            read: m.read
        }));

        res.json({
            success: true,
            data: formattedMessages,
            count: formattedMessages.length
        });

    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
});

// Send message
router.post('/send', async (req, res) => {
    try {
        const { senderId, recipientId, text, conversationId } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ message: 'Message text is required' });
        }

        let targetConversationId = conversationId;

        // Find or create conversation if not provided
        if (!targetConversationId) {
            let conversation = await Conversation.findOne({
                participants: { $all: [senderId, recipientId] }
            });

            if (!conversation) {
                conversation = new Conversation({
                    participants: [senderId, recipientId]
                });
                await conversation.save();
            }
            targetConversationId = conversation._id;
        }

        // Create message
        const newMessage = new Message({
            conversationId: targetConversationId,
            senderId,
            recipientId,
            text: text.trim(),
            createdAt: new Date()
        });

        await newMessage.save();

        // Update conversation last message
        await Conversation.findByIdAndUpdate(targetConversationId, {
            lastMessage: newMessage._id,
            updatedAt: new Date()
        });

        // Emit to recipient's room for real-time update
        const io = req.app.get('io');
        if (io) {
            io.to(`user:${recipientId}`).emit('new-message', {
                id: newMessage._id,
                conversationId: targetConversationId,
                senderId,
                recipientId,
                text: newMessage.text,
                timestamp: newMessage.createdAt,
                read: false
            });
        }

        res.status(201).json({
            success: true,
            message: 'Message sent',
            data: {
                id: newMessage._id,
                conversationId: targetConversationId,
                senderId,
                recipientId,
                text: newMessage.text,
                timestamp: newMessage.createdAt,
                read: false
            }
        });

    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: 'Failed to send message' });
    }
});

// Mark messages as read
router.put('/read', async (req, res) => {
    try {
        const { messageIds } = req.body;

        if (Array.isArray(messageIds) && messageIds.length > 0) {
            await Message.updateMany(
                { _id: { $in: messageIds } },
                { $set: { read: true, readAt: new Date() } }
            );
        }

        res.json({ success: true, message: 'Messages marked as read' });

    } catch (error) {
        res.status(500).json({ message: 'Failed to mark as read' });
    }
});

module.exports = router;
