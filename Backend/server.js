const express = require("express");
const shipmentRoutes = require("./routes/shipmentRoutes");
const vehicleDispatchRoutes =
    require("./routes/vehicleDispatchRoutes");
const dotenv = require("dotenv");
const cors = require("cors");
const masterDataRoutes =
    require("./routes/masterDataRoutes");

const connectDB = require("./config/db");

const manifestRoutes =
    require("./routes/manifestRoutes");

const authRoutes = require("./routes/authRoutes");
const protect = require("./middleware/authMiddleware");
const quoteRoutes = require("./routes/quoteRoutes");


/* Load environment variables */

dotenv.config();


/* Connect to MongoDB */

connectDB();


/* Create Express app */

const app = express();

const PORT = process.env.PORT || 5000;


/* Middleware */

app.use(cors());
app.use(express.json());
app.use("/api/shipments", shipmentRoutes);
app.use(
    "/api/vehicle-dispatches",
    vehicleDispatchRoutes
);
app.use(
    "/api/manifests",
    manifestRoutes
);
app.use(
    "/api/master-data",
    masterDataRoutes
);

app.use("/api/auth", authRoutes);
app.use("/api/quotes", quoteRoutes);

/* Test route */

app.get("/", (req, res) => {

    res.json({
        message: "Countrywide Logistics Backend is running."
    });

});

app.get("/api/test-protected", protect, (req, res) => {
    res.json({
        message: "You accessed a protected route!",
        user: req.user
    });
});


/* Start server */

app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});