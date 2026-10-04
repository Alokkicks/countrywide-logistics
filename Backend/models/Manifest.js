const mongoose = require("mongoose");

const manifestSchema = new mongoose.Schema({

    /* =====================================================
       MANIFEST DETAILS
    ===================================================== */

    challanNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    manifestDate: {
        type: Date,
        required: true
    },

    manifestFrom: {
        type: String,
        required: true,
        trim: true
    },

    manifestTo: {
        type: String,
        required: true,
        trim: true
    },

    branch: {
        type: String,
        required: true,
        trim: true
    },

    trainName: {
        type: String,
        trim: true,
        default: ""
    },


    /* =====================================================
       SHIPMENTS ASSIGNED TO THIS MANIFEST
    ===================================================== */

    shipments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shipment"
        }
    ]


}, {
    timestamps: true
});


const Manifest =
    mongoose.model("Manifest", manifestSchema);


module.exports = Manifest;