const mongoose = require("mongoose");


/* =====================================================
   VEHICLE DISPATCH SCHEMA
===================================================== */

const vehicleDispatchSchema =
    new mongoose.Schema({

        /* ==============================
           VEHICLE DETAILS
        ============================== */

        vehicleNumber: {
            type: String,
            required: true,
            trim: true
        },

        ownerName: {
            type: String,
            required: true,
            trim: true
        },

        ownerAadhaar: {
            type: String,
            required: true,
            trim: true
        },


        /* ==============================
           DRIVER DETAILS
        ============================== */

        driverName: {
            type: String,
            required: true,
            trim: true
        },

        driverPhone: {
            type: String,
            required: true,
            trim: true
        },

        driverDL: {
            type: String,
            required: true,
            trim: true
        },


        /* ==============================
           ROUTE DETAILS
        ============================== */

        origin: {
            type: String,
            required: true,
            trim: true
        },

        destination: {
            type: String,
            required: true,
            trim: true
        },

        dispatchDate: {
            type: Date,
            required: true
        },


        /* ==============================
           CONSIGNMENTS
        ============================== */

        shipmentIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Shipment",
                required: true
            }
        ],


        /* ==============================
           DISPATCH STATUS
        ============================== */

        status: {
            type: String,
            enum: [
                "Dispatched",
                "In Transit",
                "Delivered",
                "Cancelled"
            ],
            default: "Dispatched"
        }

    }, {
        timestamps: true
    });


module.exports =
    mongoose.model(
        "VehicleDispatch",
        vehicleDispatchSchema
    );