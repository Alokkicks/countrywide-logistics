const mongoose =
    require("mongoose");

const VehicleDispatch =
    require("../models/vehicleDispatch");

const Shipment =
    require("../models/Shipment");


/* =====================================================
   CREATE VEHICLE DISPATCH
===================================================== */

const createVehicleDispatch =
    async (req, res) => {

        try {

            const {
                vehicleNumber,
                ownerName,
                ownerAadhaar,
                driverName,
                driverPhone,
                driverDL,
                origin,
                destination,
                dispatchDate,
                shipmentIds
            } = req.body;


            /* ==============================
               VALIDATION
            ============================== */

            if (
                !vehicleNumber ||
                !ownerName ||
                !ownerAadhaar ||
                !driverName ||
                !driverPhone ||
                !driverDL ||
                !origin ||
                !destination ||
                !dispatchDate
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "All vehicle, driver and route details are required."

                });

            }


            if (
                !Array.isArray(shipmentIds) ||
                shipmentIds.length === 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "At least one consignment must be assigned."

                });

            }


            /* ==============================
               VALIDATE SHIPMENT IDs
            ============================== */

            const invalidId =
                shipmentIds.find(
                    id =>
                        !mongoose.Types.ObjectId
                            .isValid(id)
                );


            if (invalidId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "One or more shipment IDs are invalid."

                });

            }


            /* ==============================
               VERIFY SHIPMENTS EXIST
            ============================== */

            const shipments =
                await Shipment.find({

                    _id: {
                        $in: shipmentIds
                    }

                }).select("_id");


            if (
                shipments.length !==
                shipmentIds.length
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "One or more selected consignments were not found."

                });

            }


            /* ==============================
               CREATE DISPATCH
            ============================== */

            const dispatch =
                await VehicleDispatch.create({

                    vehicleNumber:
                        String(vehicleNumber).trim(),

                    ownerName:
                        String(ownerName).trim(),

                    ownerAadhaar:
                        String(ownerAadhaar).trim(),

                    driverName:
                        String(driverName).trim(),

                    driverPhone:
                        String(driverPhone).trim(),

                    driverDL:
                        String(driverDL).trim(),

                    origin:
                        String(origin).trim(),

                    destination:
                        String(destination).trim(),

                    dispatchDate,

                    shipmentIds

                });


            /* ==============================
               RETURN POPULATED DISPATCH
            ============================== */

            const populatedDispatch =
                await VehicleDispatch
                    .findById(dispatch._id)
                    .populate(
                        "shipmentIds"
                    );


            res.status(201).json({

                success: true,

                message:
                    "Vehicle dispatch created successfully.",

                dispatch:
                    populatedDispatch

            });


        } catch (error) {

            console.error(
                "Create vehicle dispatch error:",
                error
            );


            if (
                error.name ===
                "ValidationError"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        error.message

                });

            }


            res.status(500).json({

                success: false,

                message:
                    "Server error while creating vehicle dispatch."

            });

        }

    };



/* =====================================================
   GET ALL VEHICLE DISPATCHES
===================================================== */

const getVehicleDispatches =
    async (req, res) => {

        try {

            const dispatches =
                await VehicleDispatch
                    .find()
                    .populate({
                        path: "shipmentIds",

                        select:
                            "cNoteNo trackingId consignor consignee bookingFrom bookingBranch destination packageCount actualWeight chargeableWeight"
                    })
                    .sort({
                        createdAt: -1
                    });


            res.status(200).json({

                success: true,

                count:
                    dispatches.length,

                dispatches

            });


        } catch (error) {

            console.error(
                "Get vehicle dispatches error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Server error while loading vehicle dispatches."

            });

        }

    };



/* =====================================================
   GET SINGLE VEHICLE DISPATCH
===================================================== */

const getVehicleDispatchById =
    async (req, res) => {

        try {

            const {
                id
            } = req.params;


            if (
                !mongoose.Types.ObjectId
                    .isValid(id)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid dispatch ID."

                });

            }


            const dispatch =
                await VehicleDispatch
                    .findById(id)
                    .populate({
                        path: "shipmentIds",

                        select:
                            "cNoteNo trackingId consignor consignee consignorGSTIN consigneeGSTIN bookingFrom bookingBranch destination packageCount actualWeight chargeableWeight goods totalAmount status"
                    });


            if (!dispatch) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Vehicle dispatch not found."

                });

            }


            res.status(200).json({

                success: true,

                dispatch

            });


        } catch (error) {

            console.error(
                "Get vehicle dispatch error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Server error while loading vehicle dispatch."

            });

        }

    };


module.exports = {

    createVehicleDispatch,

    getVehicleDispatches,

    getVehicleDispatchById

};