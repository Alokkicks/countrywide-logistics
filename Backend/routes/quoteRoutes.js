const express = require("express");

const {
    createQuote,
    getQuotes,
    updateQuoteStatus
} = require("../controllers/quoteController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// PUBLIC
// Customer submits a quote enquiry
router.post(
    "/",
    createQuote
);


// PROTECTED
// Employee dashboard gets all quote enquiries
router.get(
    "/",
    protect,
    getQuotes
);


// PROTECTED
// Employee updates quote status
router.patch(
    "/:id/status",
    protect,
    updateQuoteStatus
);


module.exports = router;