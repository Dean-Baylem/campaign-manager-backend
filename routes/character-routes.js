const express = require("express");
const { check } = require("express-validator");

const characterControllers = require("../controllers/character-controllers/character-controllers");
const router = express.Router();

router.post("/new-character/:playerid/:campaignid", [
  check("name").not().isEmpty(),
  check("species").not().isEmpty(),
  check("age").not().isEmpty(),
  check("playerClass").not().isEmpty(),
  check("name").not().isEmpty(),
], characterControllers.createCharacter);

router.get("/get-character/:characterid", characterControllers.getCharacterById);

router.get("/get-all-in-campaign/:campaignid", characterControllers.getCharactersByCampaignId);

router.patch("/update-character/:characterid", characterControllers.updateCharacter);

router.delete("/delete-character/:characterid", characterControllers.deleteCharacter);

module.exports = router;