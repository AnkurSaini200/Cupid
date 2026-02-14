// Database Connection Configuration
const mongoose = require('mongoose');

// MongoDB Connection
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Cupid';

        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // Add other options as needed
        };

        await mongoose.connect(mongoURI, options);

        console.log('✅ MongoDB Connected Successfully');
        console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB Connection Error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️  MongoDB Disconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed due to app termination');
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ MongoDB Connection Failed:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
