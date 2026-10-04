const Manifest = require("../models/Manifest");
const Shipment = require("../models/Shipment");


/* =====================================================
   CREATE MANIFEST
===================================================== */

const createManifest = async (req, res) => {

    try {

        const {
            challanNumber,
            manifestDate,
            manifestFrom,
            manifestTo,
            branch,
            trainName,
            shipmentIds
        } = req.body;


        /* -------------------------------------------------
           BASIC VALIDATION
        ------------------------------------------------- */

        if (
            !challanNumber ||
            !manifestDate ||
            !manifestFrom ||
            !manifestTo ||
            !branch
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required manifest details."
            });
        }


        if (
            !Array.isArray(shipmentIds) ||
            shipmentIds.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Please assign at least one shipment."
            });
        }


        /* -------------------------------------------------
           CHECK DUPLICATE CHALLAN
        ------------------------------------------------- */

        const existingManifest =
            await Manifest.findOne({
                challanNumber: challanNumber.trim()
            });

        if (existingManifest) {

            return res.status(400).json({
                success: false,
                message: "Challan / VPH number already exists."
            });

        }


        /* -------------------------------------------------
           FIND SHIPMENTS
        ------------------------------------------------- */

        const shipments =
            await Shipment.find({
                _id: { $in: shipmentIds }
            });


        if (shipments.length !== shipmentIds.length) {

            return res.status(400).json({
                success: false,
                message: "One or more selected shipments were not found."
            });

        }


        /* -------------------------------------------------
           CHECK WHETHER SHIPMENTS ARE ALREADY ASSIGNED
        ------------------------------------------------- */

        const alreadyAssigned =
            shipments.find(
                shipment =>
                    shipment.challanNumber &&
                    shipment.challanNumber.trim() !== ""
            );


        if (alreadyAssigned) {

            return res.status(400).json({
                success: false,
                message:
                    `Shipment ${alreadyAssigned.trackingId} is already assigned to a manifest.`
            });

        }


        /* -------------------------------------------------
           CREATE MANIFEST
        ------------------------------------------------- */

        const manifest =
            await Manifest.create({

                challanNumber:
                    challanNumber.trim(),

                manifestDate,

                manifestFrom:
                    manifestFrom.trim(),

                manifestTo:
                    manifestTo.trim(),

                branch:
                    branch.trim(),

                trainName:
                    trainName
                        ? trainName.trim()
                        : "",

                shipments:
                    shipmentIds

            });


        /* -------------------------------------------------
           UPDATE SHIPMENTS
        ------------------------------------------------- */

        await Shipment.updateMany(

            {
                _id: {
                    $in: shipmentIds
                }
            },

            {
                $set: {
                    challanNumber:
                        challanNumber.trim(),

                    manifestDate,

                    manifestFrom:
                        manifestFrom.trim(),

                    manifestTo:
                        manifestTo.trim()
                }
            }

        );


        /* -------------------------------------------------
           RETURN COMPLETE MANIFEST
        ------------------------------------------------- */

        const completeManifest =
            await Manifest.findById(manifest._id)
                .populate("shipments");


        res.status(201).json({

            success: true,

            message:
                "Manifest created successfully.",

            manifest:
                completeManifest

        });


    } catch (error) {

        console.error(
            "Create manifest error:",
            error.message
        );


        if (error.code === 11000) {

            return res.status(400).json({
                success: false,
                message:
                    "Challan / VPH number already exists."
            });

        }


        res.status(500).json({

            success: false,

            message:
                "Server error while creating manifest."

        });

    }

};


/* =====================================================
   GET MANIFEST BY CHALLAN NUMBER
===================================================== */

const getManifestByChallan = async (req, res) => {

    try {

        const challanNumber =
            req.params.challanNumber.trim();


        const manifest =
            await Manifest.findOne({
                challanNumber
            })
                .populate("shipments");


        if (!manifest) {

            return res.status(404).json({

                success: false,

                message:
                    "Manifest not found."

            });

        }


        res.status(200).json({

            success: true,

            manifest

        });


    } catch (error) {

        console.error(
            "Get manifest error:",
            error.message
        );


        res.status(500).json({

            success: false,

            message:
                "Server error while fetching manifest."

        });

    }

};


module.exports = {
    createManifest,
    getManifestByChallan
};