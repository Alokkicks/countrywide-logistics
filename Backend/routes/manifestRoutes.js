const express = require("express");

const {
    createManifest,
    getManifestByChallan
} = require("../controllers/manifestController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


/* Create Manifest */
router.post(
    "/",protect,
    createManifest
);


/* Find Manifest by Challan / VPH Number */
router.get(
    "/:challanNumber",protect,
    getManifestByChallan
);


module.exports = router;