const mongoose = require("mongoose");


/* =====================================================
   SHIPMENT SCHEMA
===================================================== */

const shipmentSchema = new mongoose.Schema({

    /* =================================================
       IDENTIFICATION
    ================================================= */

    // Existing field kept temporarily for compatibility
    // with current tracking/payment/status functions.
    trackingId: {
        type: String,
        trim: true,
        default: ""
    },

    // Complete C/Note number.
    // Example: 92822745
    cNoteNo: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },


  
    


    // Complete generated invoice number.
    // Example: GST/1345/26-27
    invoiceNo: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },



    /* =================================================
       BASIC CONSIGNMENT INFORMATION
    ================================================= */

    bookingDate: {
        type: Date,
        required: true
    },

    bookingBranch: {
        type: String,
        required: true,
        trim: true
    },

    bookingFrom: {
        type: String,
        required: true,
        trim: true
    },

    destination: {
        type: String,
        required: true,
        trim: true
    },

    branch: {
        type: String,
        trim: true,
        default: ""
    },

    account: {
        type: String,
        trim: true,
        default: ""
    },

    cNoteType: {
        type: String,
        required: true,
        enum: [
            "to-pay",
            "to-billed",
            "paid-bilty",
            "consignee-paid-adv",
            "foc-bilty"
        ]
    },


    /* =================================================
       CONSIGNOR / CONSIGNEE
    ================================================= */

    consignor: {
        type: String,
        trim: true,
        default: ""
    },

    consignorGSTIN: {
        type: String,
        trim: true,
        default: ""
    },

    consignee: {
        type: String,
        trim: true,
        default: ""
    },

    consigneeGSTIN: {
        type: String,
        trim: true,
        default: ""
    },


    /* =================================================
       BILLING PARTY
    ================================================= */

    billingParty: {
        type: String,
        required: true,
        trim: true
    },

    billingBranch: {
        type: String,
        trim: true,
        default: ""
    },


    /* =================================================
       GOODS INFORMATION
    ================================================= */

    goods: {
        type: String,
        required: true,
        trim: true
    },

    goodsDescription: {
        type: String,
        trim: true,
        default: ""
    },

    hsnSacCode: {
        type: String,
        trim: true,
        default: ""
    },


    /* =================================================
       PACKAGE INFORMATION
    ================================================= */

    packageCount: {
        type: Number,
        required: true,
        min: 1
    },

    packageType: {
        type: String,
        required: true,
        trim: true
    },

    packageMode: {
        type: String,
        trim: true,
        default: ""
    },


    /* =================================================
       WEIGHT INFORMATION
    ================================================= */

    actualWeight: {
        type: Number,
        required: true,
        min: 0
    },

    netWeight: {
        type: Number,
        default: 0,
        min: 0
    },

    grossWeight: {
        type: Number,
        default: 0,
        min: 0
    },

    chargeableWeight: {
        type: Number,
        required: true,
        min: 0
    },


    /* =================================================
       RATE / FREIGHT
    ================================================= */

    freightRate: {
        type: Number,
        required: true,
        min: 0
    },

    // "In" field shown in the client's reference software.
    // Kept as text until the client confirms its exact meaning.
    rateIn: {
        type: String,
        trim: true,
        default: ""
    },

    freightAmount: {
        type: Number,
        default: 0,
        min: 0
    },


    /* =================================================
       VALUE / INVOICE INFORMATION
    ================================================= */

    chargeableValue: {
        type: Number,
        default: 0,
        min: 0
    },

    invoiceDate: {
        type: Date,
        default: null
    },


    /* =================================================
       E-WAY BILL / OTHER INFORMATION
    ================================================= */

    waybillNo: {
        type: String,
        trim: true,
        default: ""
    },

    ewayBillNo: {
        type: String,
        trim: true,
        default: ""
    },

    ewayBillDate: {
        type: Date,
        default: null
    },

    stYN: {
        type: String,
        enum: ["Y", "N", ""],
        default: ""
    },

    risk: {
        type: String,
        trim: true,
        default: ""
    },

    delivery: {
        type: String,
        trim: true,
        default: ""
    },

    agent: {
        type: String,
        trim: true,
        default: ""
    },


    /* =================================================
       CHARGES
    ================================================= */

    stCharge: {
        type: Number,
        default: 0,
        min: 0
    },

    deliveryCharge: {
        type: Number,
        default: 0,
        min: 0
    },

    labourCharge: {
        type: Number,
        default: 0,
        min: 0
    },

    otherCharges: {
        type: Number,
        default: 0,
        min: 0
    },

    adjustment: {
        type: Number,
        default: 0
    },

    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },


    /* =================================================
       PAYMENT DETAILS
    ================================================= */

    paymentStatus: {
        type: String,
        enum: ["Outstanding", "Partial", "Paid"],
        default: "Outstanding"
    },

    amountReceived: {
        type: Number,
        default: 0,
        min: 0
    },

    outstandingAmount: {
        type: Number,
        default: function () {
            return this.totalAmount || 0;
        },
        min: 0
    },


    /* =================================================
       SHIPMENT STATUS
    ================================================= */

    status: {
        type: String,
        enum: [
            "Pending",
            "In Transit",
            "Delivered"
        ],
        default: "Pending"
    },


    /* =================================================
       MANIFEST / DISPATCH
    ================================================= */

    challanNumber: {
        type: String,
        trim: true,
        default: ""
    },

    manifestDate: {
        type: Date,
        default: null
    },

    manifestFrom: {
        type: String,
        trim: true,
        default: ""
    },

    manifestTo: {
        type: String,
        trim: true,
        default: ""
    }

}, {
    timestamps: true
});


/* =====================================================
   CREATE MODEL
===================================================== */

const Shipment = mongoose.model(
    "Shipment",
    shipmentSchema
);


module.exports = Shipment;