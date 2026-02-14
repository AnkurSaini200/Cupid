// Database Models
// These are Mongoose schemas for MongoDB
// You can also adapt these for PostgreSQL, MySQL, etc.

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
    gender: {
        type: String,
        enum: ['male', 'female', 'non-binary', 'other', 'prefer-not-to-say']
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
    verified: {
        type: Boolean,
        default: false
    },
    verificationPhotos: [{
        url: String,
        uploadedAt: Date
    }],
    socials: {
        instagram: String,
        snapchat: String,
        tiktok: String,
        discord: String
    },
    preferences: {
        distance: {
            type: Number,
            default: 50
        },
        ageRange: {
            min: Number,
            max: Number
        },
        showOnline: {
            type: Boolean,
            default: true
        },
        notifications: {
            messages: { type: Boolean, default: true },
            matches: { type: Boolean, default: true },
            hmu: { type: Boolean, default: true }
        }
    },
    online: {
        type: Boolean,
        default: false
    },
    lastActive: Date,
    blocked: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: Date
});

// Match Schema
const matchSchema = new mongoose.Schema({
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    status: {
        type: String,
        enum: ['active', 'unmatched'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
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

// Message Schema
const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
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
    text: {
        type: String,
        required: true
    },
    media: [{
        type: String,
        url: String
    }],
    read: {
        type: Boolean,
        default: false
    },
    readAt: Date,
    delivered: {
        type: Boolean,
        default: false
    },
    deliveredAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Conversation Schema
const conversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: Date
});

// HMU Post Schema
const hmuPostSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    activity: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true,
        maxlength: 500
    },
    location: {
        name: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    scheduledTime: Date,
    active: {
        type: Boolean,
        default: true
    },
    responses: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        message: String,
        createdAt: Date
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: Date
});

// Community Schema
const communitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    icon: String,
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    longDescription: String,
    cover: String,
    isPublic: {
        type: Boolean,
        default: true
    },
    rules: [String],
    moderators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    members: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['member', 'moderator', 'admin'],
            default: 'member'
        },
        joinedAt: Date
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Community Post Schema
const communityPostSchema = new mongoose.Schema({
    communityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    media: [{
        type: String,
        url: String
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        text: String,
        createdAt: Date
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Notification Schema
const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['match', 'message', 'hmu_response', 'community_post', 'friend_request'],
        required: true
    },
    title: String,
    message: String,
    data: mongoose.Schema.Types.Mixed,
    read: {
        type: Boolean,
        default: false
    },
    readAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ 'location.coordinates': '2dsphere' });
swipeSchema.index({ userId: 1, targetUserId: 1 });
matchSchema.index({ users: 1 });
messageSchema.index({ conversationId: 1, createdAt: -1 });
hmuPostSchema.index({ 'location.coordinates': '2dsphere' });
communitySchema.index({ name: 1, category: 1 });

// Export models
const User = mongoose.model('User', userSchema);
const Match = mongoose.model('Match', matchSchema);
const Swipe = mongoose.model('Swipe', swipeSchema);
const Message = mongoose.model('Message', messageSchema);
const Conversation = mongoose.model('Conversation', conversationSchema);
const HMUPost = mongoose.model('HMUPost', hmuPostSchema);
const Community = mongoose.model('Community', communitySchema);
const CommunityPost = mongoose.model('CommunityPost', communityPostSchema);
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = {
    User,
    Match,
    Swipe,
    Message,
    Conversation,
    HMUPost,
    Community,
    CommunityPost,
    Notification
};
