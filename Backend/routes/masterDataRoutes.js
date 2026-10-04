const express = require("express");

const {
    searchMasterData,
    createMasterData
} = require("../controllers/masterDatacontroller");


const router = express.Router();


/* Search saved master data */

router.get("/", searchMasterData);


/* Save new master data */

router.post("/", createMasterData);


module.exports = router;