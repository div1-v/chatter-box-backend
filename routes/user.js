const express = require("express");

const router = express.Router();
const userController = require("../controllers/user");
const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");

//User Routes
router.route("/signup").post( userController.createUser); //Signup user
router.route("/password").post(userController.login); //login
router.route("/users").post(userController.searchUser); //get User
router.route('/email').post(userController.searchEmail);
router.route("/user").put( userController.updateUserDetails); //update user
router.route('/user-details').get(userController.getUser);

module.exports = router;
