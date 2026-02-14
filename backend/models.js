const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true,
        min: 13
    },
    location: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        maxlength: 500
    },
    interests: [{
        type: String
    }],
    photos: [{
        type: String
    }],
    avatar: String,
    socials: {
        instagram: String,
        snapchat: String,
        tiktok: String,
        discord: String,
        twitter: String
    },
    online: {
        type: Boolean,
        default: false
    },
    lastActive: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Community Schema
const communitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: String,
    category: String,
    icon: String,
    cover: String,
    members: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }]
});

// HMU Post Schema
const hmuPostSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    activity: String,
    text: String,
    location: {
        name: String
    },
    responses: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        message: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Message Schema
const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation'
    },
    communityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community'
    },
    text: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    read: {
        type: Boolean,
        default: false
    }
});

// Conversation Schema
const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Match Schema - Simple for now
const matchSchema = new mongoose.Schema({
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Swipe Schema
const swipeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    direction: {
        type: String,
        enum: ['left', 'right', 'super'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);
const Community = mongoose.model('Community', communitySchema);
const HMUPost = mongoose.model('HMUPost', hmuPostSchema);
const Message = mongoose.model('Message', messageSchema);
const Conversation = mongoose.model('Conversation', conversationSchema);
const Match = mongoose.model('Match', matchSchema);
const Swipe = mongoose.model('Swipe', swipeSchema);

module.exports = { User, Community, HMUPost, Message, Conversation, Match, Swipe };
