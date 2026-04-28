require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./src/models/Admin');
const connectDB = require('./src/config/db');

const seedAdmin = async () => {
    try {
        await connectDB();

        const adminExists = await Admin.findOne({ email: 'admin@example.com' });

        if (adminExists) {
            console.log('Admin already exists');
            process.exit();
        }

        const admin = new Admin({
            name: 'Super Admin',
            email: 'admin@example.com',
            password: 'admin123' // This will be hashed by the pre-save hook
        });

        await admin.save();

        console.log('Admin seeded successfully');
        console.log('Email: admin@example.com');
        console.log('Password: admin123');
        
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();
