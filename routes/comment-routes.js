const express = require("express");
const { check } = require("express-validator");

const commentControllers = require("../controllers/comment-controllers");
const router = express.Router();

router.post("/new-world-comment/:playerid/:worldid", [
    check("body").not().isEmpty(),
], commentControllers.addWorldComment);

router.patch(
  "/update/:commentid",
  [check("body").not().isEmpty()],
  commentControllers.updateCommentbyId
);

router.delete("/delete/:commentid", commentControllers.deleteCommentById);

module.exports = router;