const mongoose = require("mongoose");

const masterDataSchema = new mongoose.Schema({

    type: {
        type: String,
        required: true,
        enum: ["consignor", "consignee", "goods"]
    },

    name: {
        type: String,
        required: true,
        trim: true
    }

}, {
    timestamps: true
});

masterDataSchema.index(
    { type: 1, name: 1 },
    { unique: true }
);

const MasterData =
    mongoose.model("MasterData", masterDataSchema);

module.exports = MasterData;