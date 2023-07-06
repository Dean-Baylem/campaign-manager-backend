const express = require("express");
const { check } = require("express-validator");

const campaignControllers = require("../controllers/campaign-controllers/campaign-controllers");
const recapControllers = require("../controllers/campaign-controllers/recap-controllers");
const sessionControllers = require("../controllers/campaign-controllers/session-controllers");
const eventControllers = require("../controllers/campaign-controllers/event-controllers");
const objectiveControllers = require("../controllers/campaign-controllers/objective-controllers");
const locationControllers = require("../controllers/campaign-controllers/location-controllers");
const plotControllers = require("../controllers/campaign-controllers/plot-controllers");
const router = express.Router();

// Core Campaign Routes
router.post(
  "/createcampaign/:playerid",
  campaignControllers.createCampaign
);

router.get("/findone/:campaignid", campaignControllers.getCampaignById);

router.get("/findall/:playerid", campaignControllers.getCampaignsByplayerId);

router.patch("/update/:campaignid", campaignControllers.updateCampaign);

router.patch("/updatevillain/:campaignid/:npcid", campaignControllers.setMainVillain);

router.delete("/deletecampaign/:campaignid", campaignControllers.deleteCampaign);

// Campaign Objective Routes

router.post("/createobjective/:campaignid", objectiveControllers.createObjective);

router.get("/getobjectivesforcampaign/:campaignid", objectiveControllers.getObjectivesByCampaignId);

router.patch("/updateobjective/:objectiveid", objectiveControllers.editObjectiveById);

router.delete("/deleteobjective/:objectiveid", objectiveControllers.deleteObjectiveById);

// Campaign Plot Act Routes

router.post('/createplot/:campaignid', plotControllers.createPlot);

router.patch('/updateplot/:plotid', plotControllers.updatePlotById);

router.delete('/deleteplot/:plotid', plotControllers.deletePlotById);

// Campaign Location Routes

router.post("/createlocation/:campaignid", locationControllers.createLocation);

router.get("/getlocationbyid/:locationid", locationControllers.getLocationById);

router.get("/getallforcampaign/:campaignid", locationControllers.getLocationsByCampaign);

router.patch("/setcurrentlocation/:locationid", locationControllers.setCurrentLocation);

router.patch("/removecurrentlocation/:locationid", locationControllers.removeCurrentLocation);

router.patch("/updatelocation/:locationid", locationControllers.updateLocationDetails);

router.delete("/deletelocation/:locationid", locationControllers.deleteLocationById);

// recap Routes

router.post("/recap/add/:campaignid", recapControllers.addRecap);

router.get("/recap/findall/:campaignid", recapControllers.getRecapsByCampaignId);

router.get("/recap/get/:recapid", recapControllers.getRecapById);

router.patch("/recap/updatebyid/:recapid", recapControllers.updateRecapById);

router.delete("/recap/delete/:recapid", recapControllers.deleteRecapById);

// Session Routes

router.post(
  "/session/:playerid/add/:campaignid",
  sessionControllers.createSession
);

router.get("/session/get/:sessionid", sessionControllers.getSessionById);

router.get("/session/bycampaign/:campaignid", sessionControllers.getAllSessionsByCampaignId);

router.get("/session/byplayer/:playerid", sessionControllers.getAllSessionsByPlayerId);

router.patch("/session/update/:sessionid", sessionControllers.updateSession);

router.delete("/session/delete/:sessionid", sessionControllers.deleteSession);

// In-game Event Routes

router.post("/events/add/:campaignid", eventControllers.addEvent);

router.get("/events/getbycampaign/:campaignid", eventControllers.getEventsByCampaignID);

router.get("/events/geteventsbyworldid/:worldid", eventControllers.getEventsByWorldId);

router.get("/events/getheroicbyworldid/:worldid", eventControllers.getHeroicEventsByWorldId);

router.patch("/events/updatebyid/:eventid", eventControllers.updateEventById);

router.patch("/events/changeheroicevents", eventControllers.changeHeroicEvents);

router.delete("/events/deletebyid/:eventid", eventControllers.deleteEventById);

module.exports = router;
