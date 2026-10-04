const Quote = require("../models/quote");

// CREATE NEW QUOTE
const createQuote = async (req, res) => {
    try {

        const {
            name,
            businessName,
            email,
            mobile,
            goodsType,
            weight,
            moreInfo
        } = req.body;

        // Basic validation
        if (
            !name ||
            !businessName ||
            !email ||
            !mobile ||
            !goodsType ||
            weight === undefined
        ) {
            return res.status(400).json({
                message: "Please fill all required fields"
            });
        }

        const quote = await Quote.create({
            name,
            businessName,
            email,
            mobile,
            goodsType,
            weight,
            moreInfo
        });

        res.status(201).json({
            message: "Quote enquiry submitted successfully",
            quote
        });

    } catch (error) {

        console.error("Create quote error:", error);

        res.status(500).json({
            message: "Server error while submitting quote"
        });
    }
};


// GET ALL QUOTES
const getQuotes = async (req, res) => {
    try {

        const quotes = await Quote.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            quotes
        });

    } catch (error) {

        console.error("Get quotes error:", error);

        res.status(500).json({
            message: "Server error while fetching quotes"
        });
    }
};


// UPDATE QUOTE STATUS
const updateQuoteStatus = async (req, res) => {
    try {

        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = [
            "New",
            "Contacted",
            "Quoted",
            "Closed"
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid quote status"
            });
        }

        const quote = await Quote.findByIdAndUpdate(
            id,
            { status },
            {
                new: true,
                runValidators: true
            }
        );

        if (!quote) {
            return res.status(404).json({
                message: "Quote not found"
            });
        }

        res.status(200).json({
            message: "Quote status updated successfully",
            quote
        });

    } catch (error) {

        console.error("Update quote status error:", error);

        res.status(500).json({
            message: "Server error while updating quote"
        });
    }
};


module.exports = {
    createQuote,
    getQuotes,
    updateQuoteStatus
};