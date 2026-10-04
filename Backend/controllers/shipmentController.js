const Shipment = require("../models/Shipment");


/* =====================================================
   CREATE SHIPMENT
===================================================== */

const createShipment = async (req, res) => {

    try {

        const data = { ...req.body };

        /* ==============================
           VALIDATE C NOTE
        ============================== */

        if (!data.cNoteNo || !String(data.cNoteNo).trim()) {

            return res.status(400).json({
                success: false,
                message: "C Note No. is required"
            });

        }

        data.cNoteNo = String(data.cNoteNo).trim();


        /* ==============================
           VALIDATE INVOICE NUMBER
        ============================== */

        if (!data.invoiceNo || !String(data.invoiceNo).trim()) {

            return res.status(400).json({
                success: false,
                message: "Invoice No. is required"
            });

        }

        data.invoiceNo = String(data.invoiceNo).trim();


       
        /* ==============================
           CREATE SHIPMENT
        ============================== */

        const shipment =
            await Shipment.create(data);


        res.status(201).json({

            success: true,

            message: "Shipment created successfully",

            shipment

        });

    } catch (error) {

        console.error(
            "Create shipment error:",
            error.message
        );


        /* Duplicate value */

        if (error.code === 11000) {

            console.error(
                "Duplicate key details:",
                {
                    keyPattern: error.keyPattern,
                    keyValue: error.keyValue
                }
            );

            return res.status(400).json({

                success: false,

                message: "Duplicate value already exists",

                duplicateField:
                    error.keyPattern,

                duplicateValue:
                    error.keyValue

            });

        }


        /* Validation error */

        if (error.name === "ValidationError") {

            return res.status(400).json({

                success: false,

                message: error.message

            });

        }


        res.status(500).json({

            success: false,

            message:
                "Server error while creating shipment"

        });

    }

};


/* =====================================================
   GET ALL SHIPMENTS
===================================================== */

const getShipments = async (req, res) => {

    try {

        const shipments = await Shipment.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: shipments.length,
            shipments
        });

    } catch (error) {

        console.error("Get shipments error:", error.message);

        res.status(500).json({
            success: false,
            message: "Server error while fetching shipments"
        });

    }

};
/* =====================================================
   SEARCH SHIPMENTS
===================================================== */

const searchShipments = async (req, res) => {

    try {

        const q = String(req.query.q || "").trim();

        if (!q) {

            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });

        }

        const searchRegex =
            new RegExp(q, "i");

        const shipments = await Shipment.find({

            $or: [

                { cNoteNo: searchRegex },

                { consignor: searchRegex },

                { consignee: searchRegex },

                { invoiceNo: searchRegex }

            ]

        }).sort({
            createdAt: -1
        });

        res.status(200).json({

            success: true,

            count: shipments.length,

            shipments

        });

    } catch (error) {

        console.error(
            "Search shipments error:",
            error.message
        );

        res.status(500).json({

            success: false,

            message:
                "Server error while searching shipments"

        });

    }

};

const getShipmentByTrackingId = async (req, res) => {
    try {

        const { trackingId } = req.params;

        if (!trackingId || !trackingId.trim()) {
            return res.status(400).json({
                success: false,
                message: "Tracking ID is required"
            });
        }

        const shipment = await Shipment.findOne({
            trackingId: trackingId.trim()
        });

        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: "Shipment not found"
            });
        }

        res.status(200).json({
            success: true,
            shipment
        });

    } catch (error) {

        console.error(
            "Get shipment by tracking ID error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error while tracking shipment"
        });

    }
};


/* =========================================
   UPDATE PAYMENT
========================================= */

const updateShipmentPayment = async (req, res) => {

    try {

        const { trackingId, paymentAmount } = req.body;


        /* -----------------------------
           VALIDATE C-NOTE
        ----------------------------- */

        if (!trackingId || !trackingId.trim()) {

            return res.status(400).json({
                success: false,
                message: "C-Note / Tracking number is required"
            });

        }


        /* -----------------------------
           VALIDATE PAYMENT AMOUNT
        ----------------------------- */

        const amount = Number(paymentAmount);

        if (!Number.isFinite(amount) || amount <= 0) {

            return res.status(400).json({
                success: false,
                message: "Payment amount must be greater than 0"
            });

        }


        /* -----------------------------
           FIND SHIPMENT
        ----------------------------- */

        const shipment = await Shipment.findOne({
            trackingId: trackingId.trim()
        });

        if (!shipment) {

            return res.status(404).json({
                success: false,
                message: "Shipment not found"
            });

        }


        /* -----------------------------
           BILL AMOUNT
        ----------------------------- */

        const billAmount =
            Number(shipment.totalAmount || 0);


        /* -----------------------------
           PREVIOUS PAYMENT
        ----------------------------- */

        const previousReceived =
            Number(shipment.amountReceived || 0);


        /* -----------------------------
           NEW PAYMENT TOTAL
        ----------------------------- */

        const newReceived =
            previousReceived + amount;


        /* -----------------------------
           PREVENT OVERPAYMENT
        ----------------------------- */

        if (newReceived > billAmount) {

            return res.status(400).json({
                success: false,
                message:
                    `Payment cannot exceed the bill amount of ₹${billAmount.toFixed(2)}`
            });

        }


        /* -----------------------------
           CALCULATE OUTSTANDING
        ----------------------------- */

        const newOutstanding =
            Math.max(
                billAmount - newReceived,
                0
            );


        /* -----------------------------
           CALCULATE PAYMENT STATUS
        ----------------------------- */

        let paymentStatus = "Outstanding";

        if (newReceived === 0) {

            paymentStatus = "Outstanding";

        }
        else if (newReceived < billAmount) {

            paymentStatus = "Partial";

        }
        else {

            paymentStatus = "Paid";

        }


        /* -----------------------------
           SAVE PAYMENT
        ----------------------------- */

        shipment.amountReceived =
            newReceived;

        shipment.outstandingAmount =
            newOutstanding;

        shipment.paymentStatus =
            paymentStatus;


        await shipment.save();


        /* -----------------------------
           RESPONSE
        ----------------------------- */

        res.status(200).json({

            success: true,

            message:
                "Payment updated successfully",

            payment: {

                trackingId:
                    shipment.trackingId,

                billAmount:
                    billAmount,

                paymentAdded:
                    amount,

                amountReceived:
                    shipment.amountReceived,

                outstandingAmount:
                    shipment.outstandingAmount,

                paymentStatus:
                    shipment.paymentStatus

            },

            shipment

        });

    }

    catch (error) {

        console.error(
            "Update payment error:",
            error.message
        );

        res.status(500).json({

            success: false,

            message:
                "Server error while updating payment"

        });

    }

};


const updateShipmentStatus = async (req, res) => {
    try {

        const { trackingId } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "Pending",
            "In Transit",
            "Delivered"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid shipment status"
            });
        }

        const shipment = await Shipment.findOneAndUpdate(
            { trackingId: trackingId },
            { status: status },
            {
                new: true,
                runValidators: true
            }
        );

        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: "Shipment not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Shipment status updated successfully",
            shipment
        });

    } catch (error) {

        console.error(
            "Update shipment status error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error while updating shipment status"
        });
    }
};


module.exports = {
    createShipment,
    getShipments,
    getShipmentByTrackingId,
    searchShipments,
    updateShipmentStatus,
    updateShipmentPayment

};