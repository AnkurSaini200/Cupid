const mongoose = require('mongoose');
const { Community } = require('./models');
require('dotenv').config();

const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

const categories = [
    { name: 'Gaming', icon: '🎮', description: 'Discuss games, find teammates, and share clips.' },
    { name: 'Lifestyle', icon: '🧘', description: 'Health, wellness, travel, and daily life.' },
    { name: 'Creativity', icon: '🎨', description: 'Art, design, writing, and creative projects.' },
    { name: 'Music', icon: '🎵', description: 'Share playlists, discuss artists, and jam together.' },
    { name: 'Movies', icon: '🎬', description: 'Film discussion, recommendations, and reviews.' },
    { name: 'TV Shows', icon: '📺', description: 'Binge-watching companions and theory crafting.' },
    { name: 'Anime', icon: '⛩️', description: 'Anime, manga, and Japanese culture.' },
    { name: 'Sports', icon: '⚽', description: 'Match discussions, fantasy leagues, and training.' },
    { name: 'Food & Drink', icon: '🍔', description: 'Recipes, restaurant reviews, and food photography.' },
    { name: 'Fashion', icon: '👗', description: 'Style trends, outfit checks, and shopping.' },
    { name: 'Identity', icon: '🌈', description: 'Self-discovery, support, and community.' },
    { name: 'Character', icon: '🎭', description: 'Roleplay, character design, and storytelling.' }
];

const seedCommunities = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/Cupid', mongooseOptions);
        console.log('Connected to MongoDB');

        for (const cat of categories) {
            const existing = await Community.findOne({ name: cat.name });
            if (!existing) {
                await Community.create({
                    name: cat.name,
                    description: cat.description,
                    category: cat.name, // Using name as category for simplicity
                    icon: cat.icon,
                    members: []
                });
                console.log(`Created community: ${cat.name}`);
            } else {
                console.log(`Community already exists: ${cat.name}`);
            }
        }

        console.log('Community seeding completed!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding communities:', error);
        process.exit(1);
    }
};

seedCommunities();
