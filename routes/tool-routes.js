const express = require("express");
const { check } = require("express-validator");

const toolContainers = require("../controllers/tool-controllers");
const router = express.Router();

router.post(
  "/add-items",
  [
    check("Name").not().isEmpty(),
    check("Type").not().isEmpty(),
    check("Rarity").not().isEmpty(),
    check("Source").not().isEmpty(),
  ],
  toolContainers.addItmes
);

router.post("/getItems", toolContainers.getItems);

// CRUD for the Wild Magic Tool

router.post("/wildmagic/createtable/:playerid", toolContainers.addWildMagicTable);

router.get("/wildmagic/getalltables/:playerid", toolContainers.getWildMagicTablesByPlayerId);

router.patch("/wildmagic/update/:tableid", toolContainers.updateWildMagicTable);

router.delete("/wildmagic/delete/:tableid", toolContainers.deleteWildMagicTableById);

router.get("/wildmagic/getstandard", toolContainers.getStandardTable);

router.post("/wildmagic/setstandard", toolContainers.setStandardTable);

module.exports = router;