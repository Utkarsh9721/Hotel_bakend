import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true, 
        trim: true 
    },
    phone: { type: String, trim: true },
    password: { type: String, select: false },
    googleId: { type: String, unique: true, sparse: true },
    googleAccessToken: String,
    googleRefreshToken: String,
    profileImage: { type: String, default: 'default-profile.jpg' },
    authMethod: { 
        type: String, 
        enum: ['local', 'google', 'guest'], 
        default: 'local' 
    },
    isAdmin: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
    loyaltyPoints: { type: Number, default: 0 },
    loyaltyTier: { 
        type: String, 
        enum: ['bronze', 'silver', 'gold', 'platinum'], 
        default: 'bronze' 
    },
    lastLogin: { type: Date, default: Date.now },
    userType: { 
        type: String, 
        enum: ['guest', 'registered'], 
        default: 'guest' 
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    emailVerificationToken: String,
    emailVerificationExpire: Date
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ✅ Pre-save hook to hash password
UserSchema.pre('save', async function(next) {
    // Only hash if password is modified
    if (!this.isModified('password')) return next();
    
    try {
        console.log('🔐 Hashing password for:', this.email);
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        console.log('✅ Password hashed successfully');
        next();
    } catch (error) {
        console.error('❌ Error hashing password:', error);
        next(error);
    }
});

UserSchema.virtual('fullName').get(function() {
    if (this.firstName && this.lastName) {
        return `${this.firstName} ${this.lastName}`;
    }
    return this.email?.split('@')[0] || 'User';
});

UserSchema.methods.comparePassword = async function(enteredPassword) {
    if (this.authMethod !== 'local' || !this.password) {
        console.log('⚠️ Password comparison skipped: authMethod=' + this.authMethod + ', hasPassword=' + !!this.password);
        return false;
    }
    console.log('🔐 Comparing passwords...');
    const result = await bcrypt.compare(enteredPassword, this.password);
    console.log('🔐 Password match result:', result);
    return result;
};

UserSchema.methods.updateLastLogin = function() {
    this.lastLogin = Date.now();
    return this.save();
};

UserSchema.methods.addBooking = function(bookingId) {
    if (!this.bookings.includes(bookingId)) {
        this.bookings.push(bookingId);
        return this.save();
    }
    return this;
};

export default mongoose.model('User', UserSchema);
