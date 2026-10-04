const MasterData = require("../models/Masterdata");


/* =====================================================
   SEARCH MASTER DATA
===================================================== */

const searchMasterData = async (req, res) => {

    try {

        const { type, search = "" } = req.query;


        /* Check whether type is valid */

        if (!["consignor", "consignee", "goods"].includes(type)) {

            return res.status(400).json({
                success: false,
                message: "Invalid master data type."
            });

        }


        /* Search by type + typed text */

        const results = await MasterData.find({

            type: type,

            name: {
                $regex: search,
                $options: "i"
            }

        })
            .sort({ name: 1 })
            .limit(10);


        res.status(200).json({

            success: true,
            data: results

        });


    } catch (error) {

        console.error("Master data search error:", error);

        res.status(500).json({

            success: false,
            message: "Could not search master data."

        });

    }

};


/* =====================================================
   SAVE MASTER DATA
===================================================== */

const createMasterData = async (req, res) => {

    try {

        const { type, name } = req.body;


        /* Validate */

        if (!type || !name || !name.trim()) {

            return res.status(400).json({

                success: false,
                message: "Type and name are required."

            });

        }


        if (!["consignor", "consignee", "goods"].includes(type)) {

            return res.status(400).json({

                success: false,
                message: "Invalid master data type."

            });

        }


        /* Check whether it already exists */

        const existing = await MasterData.findOne({

            type: type,

            name: name.trim()

        });


        if (existing) {

            return res.status(200).json({

                success: true,
                message: "Master data already exists.",
                data: existing

            });

        }


        /* Create new record */

        const masterData = await MasterData.create({

            type: type,

            name: name.trim()

        });


        res.status(201).json({

            success: true,

            message: "Master data saved successfully.",
            data: masterData

        });


    } catch (error) {

        console.error("Master data creation error:", error);

        res.status(500).json({

            success: false,
            message: "Could not save master data."

        });

    }

};


module.exports = {

    searchMasterData,
    createMasterData

};