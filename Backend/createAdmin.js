require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const connectDB = require("./config/db");
const User = require("./models/user");

const createAdmin = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Admin details
        const name = "Admin";
        const email = "admin@countrywidelogistics.com";
        const password = "Admin@12345";

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email });

        if (existingAdmin) {
            console.log("Admin account already exists.");
            process.exit(0);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create admin
        const admin = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "admin",
            isActive: true
        });

        console.log("Admin created successfully!");
        console.log("Email:", admin.email);
        console.log("Role:", admin.role);

        process.exit(0);

    } catch (error) {
        console.error("Error creating admin:", error);
        process.exit(1);
    }
};

createAdmin();