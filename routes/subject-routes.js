const express = require("express");
const { check } = require("express-validator");

const subjectControllers = require("../controllers/worldbuilding-controllers/subject-controllers");
const router = express.Router();

router.post(
    "/:worldid/createsubject",
    [
        check('subjectType').not().isEmpty(),
        check('subjectName').not().isEmpty(),
        check('desc').not().isEmpty()
    ],
    subjectControllers.createSubject
);

module.exports = router;
