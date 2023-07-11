const express = require("express");
const { check } = require("express-validator");

const npcControllers = require("../controllers/npc-controllers/npc-controllers");
const factionControllers = require("../controllers/npc-controllers/faction-controllers");
const router = express.Router();

// Individual NPC CRUD routes

router.post(
  "/new-npc/:campaignid",
  [
    check("name").not().isEmpty(),
    check("species").not().isEmpty(),
    check("appearance").isLength({ max: 150 }),
  ],
  npcControllers.createNPC
);

router.get("/npc/fetchbyid/:npcid", npcControllers.getNPCById);

router.get(
  "/npc/fetchbycampaign/:campaignid",
  npcControllers.getNPCsByCampaignId
);

router.patch("/npc/:npcid", npcControllers.updateNPC);

router.delete("/deletenpc/:npcid", npcControllers.deleteNPC);

// Faction CRUD routes

router.post(
  "/faction/new-faction/:campaignid",
  factionControllers.createFaction
);

router.post(
  "/faction/note/addnote/:factionid",
  factionControllers.addFactionNote
);

router.patch(
  "/faction/note/:noteid/editnote/:factionid",
  factionControllers.editFactionNote
);

router.get(
  "/faction/getbycampaign/:campaignid",
  factionControllers.getFactionsByCampaignId
);

router.get("/faction/getbyid/:factionid", factionControllers.getFactionById);

router.patch("/faction/edit/:factionid", factionControllers.updateFaction);

router.patch(
  "/faction/add-members/:factionid",
  factionControllers.addFactionMembers
);

router.patch(
  "/faction/remove-members/:factionid",
  factionControllers.removeFactionMembers
);

router.delete(
  "/faction/deletebyid/:factionid",
  factionControllers.deleteFactionById
);

router.delete(
  "/faction/note/:noteid/delete/:factionid", factionControllers.deleteFactionNoteById
);

module.exports = router;
