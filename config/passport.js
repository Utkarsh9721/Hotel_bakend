// backend/config/passport.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Loading Passport Configuration...');

// Get Google credentials
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleCallbackURL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

console.log('🔑 Google Client ID:', googleClientId ? '✅ Set' : '❌ Missing');
console.log('📌 Callback URL:', googleCallbackURL);

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// ✅ Google Strategy
if (googleClientId && googleClientSecret) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: googleClientId,
                clientSecret: googleClientSecret,
                callbackURL: googleCallbackURL,
                passReqToCallback: true
            },
            async (req, accessToken, refreshToken, profile, done) => {
                try {
                    console.log('🔑 Google profile received:', profile.id);
                    console.log('📧 Email:', profile.emails?.[0]?.value);

                    // Find or create user
                    let user = await User.findOne({ googleId: profile.id });

                    if (!user) {
                        // Check if user exists with same email
                        user = await User.findOne({ email: profile.emails[0].value });

                        if (user) {
                            // Link Google account to existing user
                            user.googleId = profile.id;
                            user.googleAccessToken = accessToken;
                            user.googleRefreshToken = refreshToken || null;
                            user.authMethod = 'google';
                            user.isVerified = true;
                            user.profileImage = profile.photos?.[0]?.value || user.profileImage;
                            await user.save();
                            console.log('✅ Google account linked to existing user:', user.email);
                        } else {
                            // Create new user
                            user = new User({
                                googleId: profile.id,
                                email: profile.emails[0].value,
                                firstName: profile.name?.givenName || '',
                                lastName: profile.name?.familyName || '',
                                profileImage: profile.photos?.[0]?.value || 'default-profile.jpg',
                                authMethod: 'google',
                                isVerified: true,
                                userType: 'registered',
                                googleAccessToken: accessToken,
                                googleRefreshToken: refreshToken || null
                            });
                            await user.save();
                            console.log('✅ New Google user created:', user.email);
                        }
                    } else {
                        // Update existing Google user
                        user.googleAccessToken = accessToken;
                        if (refreshToken) {
                            user.googleRefreshToken = refreshToken;
                        }
                        user.lastLogin = Date.now();
                        await user.save();
                        console.log('✅ Google user updated:', user.email);
                    }

                    return done(null, user);
                } catch (error) {
                    console.error('❌ Google Strategy Error:', error);
                    return done(error, null);
                }
            }
        )
    );
    console.log('✅ Google Strategy registered successfully!');
    console.log('📋 Available strategies:', Object.keys(passport._strategies));
} else {
    console.warn('⚠️ Google OAuth credentials not configured.');
}

export default passport;