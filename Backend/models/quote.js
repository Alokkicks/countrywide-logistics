const mongoose = require("mongoose");

const quoteSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        businessName: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            trim: true
        },

        mobile: {
            type: String,
            required: true,
            trim: true
        },

        goodsType: {
            type: String,
            required: true,
            trim: true
        },

        weight: {
            type: Number,
            required: true,
            min: 0
        },

        moreInfo: {
            type: String,
            trim: true,
            default: ""
        },

        status: {
            type: String,
            enum: [
                "New",
                "Contacted",
                "Quoted",
                "Closed"
            ],
            default: "New"
        }
    },
    {
        timestamps: true
    }
);

const Quote = mongoose.model(
    "Quote",
    quoteSchema
);

module.exports = Quote;