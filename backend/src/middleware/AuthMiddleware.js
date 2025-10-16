import passport from "passport";

// Middleware to check if the user is logged in using Bearer token
const isLoggedIn = (req, res, next) => {
  passport.authenticate('bearer', {session: false})(req,res, next)
}

export { isLoggedIn };

