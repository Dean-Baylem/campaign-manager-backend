const express = require("express");
const { check } = require("express-validator");

const subjectControllers = require("../controllers/worldbuilding-controllers/subject-controllers");
const router = express.Router();

router.post(
    "/:worldid/createcountry",
    [
        check('countryName').not().isEmpty(),
        check('desc').not().isEmpty()
    ],
    subjectControllers.createCountry
);

module.exports = router;
