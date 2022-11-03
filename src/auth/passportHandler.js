import passport from "passport";
import passportLocal from "passport-local";
import passportJwt from "passport-jwt";
//import { User } from "../models/user";
import { User } from "../util/middleware/connection";
import { JWT_SECRET } from "../util/secrets";

const LocalStrategy = passportLocal.Strategy;
const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;

passport.use(new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
  console.log("passport handler calling ")
  User.findOne({ where: { email: email } }, (err, user) => {
    if (err) { return done(err); }
    if (!user) {
      return done(undefined, false, { message: `username ${email} not found.` });
    }
    user.comparePassword(password, (err, isMatch) => {
      if (err) { return done(err); }
      if (isMatch) {
        return done(undefined, user);
      }
      return done(undefined, false, { message: "Invalid username or password." });
    });
  });
}));

passport.use(new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET
  }, function (jwtToken, done) {
    User.findOne({ where: { email: jwtToken.email } }, function (err, user) {
      if (err) { return done(err, false); }
      if (user) {
        return done(undefined, user, jwtToken);
      } else {
        return done(undefined, false);
      }
    });
  }));