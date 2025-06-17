const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Verifica se o usuário já existe
      let user = await User.findOne({ email: profile.emails[0].value });

      if (!user) {
        // Cria um novo usuário se não existir
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id
        });
      }

      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
)); 