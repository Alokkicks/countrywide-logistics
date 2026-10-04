const express =
    require("express");

const protect =
    require("../middleware/authMiddleware");


const {
    createVehicleDispatch,
    getVehicleDispatches,
    getVehicleDispatchById
} =
    require(
        "../controllers/vehicleDispatchController"
    );


const router =
    express.Router();



/* =====================================================
   VEHICLE DISPATCH ROUTES
===================================================== */


/* Create vehicle dispatch */

router.post(
    "/",
    protect,
    createVehicleDispatch
);


/* Get all vehicle dispatches */

router.get(
    "/",
    protect,
    getVehicleDispatches
);


/* Get one vehicle dispatch */

router.get(
    "/:id",
    protect,
    getVehicleDispatchById
);


module.exports =
    router;