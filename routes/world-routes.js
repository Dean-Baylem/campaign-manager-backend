const express = require("express");
const { check } = require("express-validator");

const worldControllers = require("../controllers/worldbuilding-controllers/world-controllers");
const router = express.Router();

router.post(
    "/:userid/createworld",
    [
        check('worldName').not().isEmpty(),
        check('worldDesc').not().isEmpty(),
    ],
    worldControllers.createWorld
);

module.exports = router;
