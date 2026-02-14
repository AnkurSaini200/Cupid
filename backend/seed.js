const mongoose = require('mongoose');
const { User, Community, HMUPost, Message, Conversation } = require('./models');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

// Sample Data
const users = [
    {
        name: 'Sarah Jenkins',
        email: 'sarah@example.com',
        password: 'password123', // In real app should be hashed
        age: 24,
        location: 'Downtown, NY',
        bio: 'Love hiking and photography! Always down for a coffee chat.',
        interests: ['Hiking', 'Photography', 'Coffee', 'Art'],
        avatar: 'https://i.pravatar.cc/150?img=5',
        photos: [
            'https://images.unsplash.com/photo-1554080353-a576cf803bda?auto=format&fit=crop&w=400&q=80',
            'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=401&q=80'
        ]
    },
    {
        name: 'Mike Chen',
        email: 'mike@example.com',
        password: 'password123',
        age: 28,
        location: 'Brooklyn, NY',
        bio: 'Tech enthusiast and gamer. Looking for gym buddies.',
        interests: ['Gaming', 'Coding', 'Gym', 'Sci-Fi'],
        avatar: 'https://i.pravatar.cc/150?img=12',
        photos: [
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80'
        ]
    },
    {
        name: 'Jessica Wong',
        email: 'jessica@example.com',
        password: 'password123',
        age: 22,
        location: 'Queens, NY',
        bio: 'Art student. I love visiting galleries and sketching in parks.',
        interests: ['Art', 'Sketching', 'Museums', 'Indie Music'],
        avatar: 'https://i.pravatar.cc/150?img=9',
        photos: []
    }
];

const communities = [
    {
        name: 'Hikers of NY',
        description: 'A group for hiking enthusiasts in the NYC area.',
        category: 'Outdoors',
        icon: '🏔️',
        members: [] // Will be populated
    },
    {
        name: 'Tech Talk',
        description: 'Discussing the latest in tech, coding, and gadgets.',
        category: 'Technology',
        icon: '💻',
        members: []
    },
    {
        name: 'Foodie Adventures',
        description: 'Exploring the best eats in the city!',
        category: 'Food',
        icon: '🍔',
        members: []
    }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Cupid', mongooseOptions);
        console.log('Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Community.deleteMany({});
        await HMUPost.deleteMany({});
        await Message.deleteMany({});
        await Conversation.deleteMany({});
        console.log('Cleared existing data');

        // Hash passwords
        const hashedUsers = await Promise.all(users.map(async (user) => {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
            return user;
        }));

        // Create Users
        const createdUsers = await User.create(hashedUsers);
        console.log(`Created ${createdUsers.length} users`);

        // Create Communities
        const createdCommunities = await Community.create(communities);
        console.log(`Created ${createdCommunities.length} communities`);

        // Create HMU Posts
        const hmuPosts = [
            {
                userId: createdUsers[0]._id, // Sarah
                activity: 'Coffee',
                text: 'Anyone free for a quick coffee break?',
                location: { name: 'Starbucks on 5th' }
            },
            {
                userId: createdUsers[1]._id, // Mike
                activity: 'Gaming',
                text: 'Looking for a duo partner for Apex Legends tonight!',
                location: { name: 'Online' }
            }
        ];
        await HMUPost.create(hmuPosts);
        console.log('Created HMU posts');

        console.log('Database seeded successfully!');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
