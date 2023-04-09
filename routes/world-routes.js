const express = require("express");
const { check } = require("express-validator");

const worldControllers = require("../controllers/worldbuilding-controllers/world-controllers");
const router = express.Router();

// World Model Routes

router.get(
  "/:worldid",
  worldControllers.getWorldById
);

router.post(
    "/:userid/createworld",
    [
        check('worldName').not().isEmpty(),
        check('worldDesc').not().isEmpty(),
    ],
    worldControllers.createWorld
);

router.patch("/:worldid/updateworld", 
  [
    check("worldName").not().isEmpty(),
    check("worldDesc").not().isEmpty(),
  ],
  worldControllers.updateWorld
);

router.delete("/:worldid/deleteworld", worldControllers.deleteWorldById);

// World Subject Model Routes
router.post(
  "/:worldid/createsubject",
  [
    check("subjectType").not().isEmpty(),
    check("subjectName").not().isEmpty(),
    check("subjectDesc").not().isEmpty(),
  ],
  worldControllers.createSubject
);

router.get("/:worldid/getsubject", worldControllers.getSubjectById);

router.get("/:worldid/getallsubjects", worldControllers.getSubjectsByWorldId);

router.patch(
  "/:worldid/updatesubject",
  [
    check("subjectName").not().isEmpty(),
    check("subjectDesc").not().isEmpty(),
  ],
  worldControllers.updateSubjectById
);

router.delete("/:worldid/deletesubject", worldControllers.deleteSubjectById);

module.exports = router;
