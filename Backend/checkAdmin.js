require("dotenv").config();

const bcrypt = require("bcryptjs");

const connectDB = require("./config/db");
const User = require("./models/user");

const checkAdmin = async () => {
    try {
        await connectDB();

        const email = "admin@countrywidelogistics.com";
        const password = "Admin@12345";

        const user = await User.findOne({ email });

        if (!user) {
            console.log("❌ Admin user NOT found");
            process.exit(0);
        }

        console.log("✅ Admin user found");
        console.log("Email:", user.email);
        console.log("Role:", user.role);
        console.log("Active:", user.isActive);

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        console.log("Password matches:", passwordMatch);

        process.exit(0);

    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkAdmin();