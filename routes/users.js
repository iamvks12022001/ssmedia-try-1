const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users_controller");
const { multerUploads } = require("../config/multer");
const passport = require("passport");

//now profile page cant be accessed without proper sign in
//this is because of  middleware added in this route
router.get(
  "/profile/:id",
  passport.checkAuthentication,
  usersController.profile
);
//profile update route
router.post(
  "/update/:id",
  passport.checkAuthentication,
  multerUploads,
  usersController.update
);

router.get("/forget_password", usersController.forget_password);
router.post("/set_new_password", usersController.set_new_password);
router.get("/reset_password/:userId/:token", usersController.reset_password);
router.get("/signupauth", usersController.signUpauth);
router.get("/sign-up", usersController.signUp);

router.get("/sign-in", usersController.signIn);

router.post("/create", usersController.create);
router.post("/verifyemail", usersController.verifyEmail);
router.post(
  "/create-session",
  passport.authenticate("local", { failureRedirect: "/users/sign-in" }),
  usersController.createSesion
);
router.get("/sign-out", usersController.destroySession);

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
); //route when user click on sign in with google
//scope is a information which are we looking to get from google
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/users/sign-in" }),
  usersController.createSesion
);
//route at which we recieve the data from google ad redirect to home page after successfull communication with google

//for friendship
router.get(
  "/friendship/:id",
  passport.checkAuthentication,
  usersController.makefriend
);
//unfollow
router.get(
  "/unfollow/:id",
  passport.checkAuthentication,
  usersController.deletefriend
);

module.exports = router;
