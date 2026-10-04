const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
    createShipment,
    getShipments,
    getShipmentByTrackingId,
    searchShipments,
    updateShipmentStatus,
    updateShipmentPayment
} = require("../controllers/shipmentController");


const router = express.Router();


/* =====================================================
   SHIPMENT ROUTES
===================================================== */

/* Create shipment */

router.post("/",protect, createShipment);


/* Get all shipments */

router.get("/",protect, getShipments);

router.get(
    "/tracking/:trackingId",
    getShipmentByTrackingId
);
router.get(
    "/search",
    protect,
    searchShipments
);
router.post(
    "/payment",protect,
    updateShipmentPayment
);

router.patch(
    "/:trackingId/status",protect,
    updateShipmentStatus

);
module.exports = router;