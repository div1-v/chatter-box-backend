const express = require("express");

const router = express.Router();
const groupController = require("../controllers/group");

//Group Routes
router.route("/group").get( groupController.getGroupDetails); //single group
router.route("/groups").get(groupController.getGroups); //all group
router.route("/group").put(groupController.updateGroup); // update a group
router.route("/group").post(groupController.createGroup); //create a group

module.exports = router;
