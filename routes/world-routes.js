const express = require("express");
const { check } = require("express-validator");

const worldControllers = require("../controllers/worldbuilding-controllers/world-controllers");
const router = express.Router();

// World Model Routes

router.get("/getall/:playerid", worldControllers.getWorldsByPlayerId);

router.get("/getone/:worldid", worldControllers.getWorldById);

router.post(
  "/createworld/:playerid",
  [check("worldName").not().isEmpty(), check("worldDesc").not().isEmpty()],
  worldControllers.createWorld
);

router.patch(
  "/updateworld/:worldid",
  [check("worldName").not().isEmpty(), check("worldDesc").not().isEmpty()],
  worldControllers.updateWorld
);

router.delete("/:worldid/deleteworld", worldControllers.deleteWorldById);

// World Subject Model Routes
router.post(
  "/createsubject/:worldid",
  [
    check("subjectType").not().isEmpty(),
    check("subjectName").not().isEmpty(),
    check("subjectDesc").not().isEmpty(),
  ],
  worldControllers.createSubject
);

router.get("/getsubject/:subjectid", worldControllers.getSubjectById);

router.get("/getallsubjects/:subjecttype/:worldid", worldControllers.getSubjectsByWorldIdAndType);

router.patch(
  "/updatesubject/:subjectid",
  [check("subjectName").not().isEmpty(), check("subjectDesc").not().isEmpty()],
  worldControllers.updateSubjectById
);

router.delete("/deletesubject/:subjectid", worldControllers.deleteSubjectById);

// Subject Record Routes

router.post("/createrecord/:subjectid", worldControllers.createSubjectRecord);

router.patch("/updaterecord/:recordid", worldControllers.updateSubjectRecord);

router.delete("/deleterecord/:recordid", worldControllers.deleteSubjectRecord);

module.exports = router;
