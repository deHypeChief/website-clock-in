import mongoose, { Schema, Types } from 'mongoose';


// session client
export interface ISessionClient extends Document {
    email: string;
    password: string;
    fullName: string;
    role: string[];
    sessions: mongoose.Types.ObjectId[];
    profile: string,
    isSocialAuth: boolean;
    isEmailVerified: boolean;
    comparePassword(inputPassword: string): Promise<boolean>;
    oAuth: {
        google: {
            googleId: string,
        }
    }
}

export interface ISession extends Document {
    sessionClientId: mongoose.Types.ObjectId;
    refreshToken: string;
    accessToken: string;
    ip?: string;
    userAgent?: string;
    lastAccessed: Date;
}

interface IOTP extends Document {
    token: number;
    expiresAt: Date;
    sessionId: mongoose.Types.ObjectId;
    used: boolean;
    purpose: "email_verification" | "2fa" | "password_reset"
}

// models
const OTPSchema = new mongoose.Schema<IOTP>({
    token: {
        type: Number,
        required: true,
    },
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SessionClient',
    },
    expiresAt: {
        type: Date,
        required: true
    },
    used: {
        type: Boolean,
        default: false
    },
    purpose: {
        type: String,
        enum: ["email_verification", "2fa", "password_reset"]
    }
}, { timestamps: true })
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }) // Automatically remove OTP after 5 minutes

const sessionClientSchema = new mongoose.Schema<ISessionClient>({
    oAuth: {
        google: {
            googleId: { type: String, unique: true, sparse: true },
        },
        twitter: {
            username: { type: String, unique: true, sparse: true },
            accessToken: { type: String, unique: true, sparse: true },
            refreshToken: { type: String, unique: true, sparse: true },
            twitterId: { type: String, unique: true, sparse: true },
        }
    },
    email: {
        type: String,
        required: true,
    },
    profile: {
        type: String,
        default: ""
    },
    fullName: {
        type: String,
        required: true,
    },
    password: {
        type: String,
    },
    role: [{
        type: String,
    }],
    sessions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session',
    }],
    isSocialAuth: {
        type: Boolean,
        default: false,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

const sessionSchema = new mongoose.Schema<ISession>({
    sessionClientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SessionClient',
    },
    refreshToken: {
        type: String,
        required: true,
    },
    accessToken: {
        type: String,
        required: true,
    },
    ip: {
        type: String, // Optionally track the IP address
    },
    userAgent: {
        type: String, // Track the device/browser the session is coming from
    },
    lastAccessed: {
        type: Date,
        default: Date.now,
    }
});


// pre actions
sessionClientSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await Bun.password.hash(this.password, "bcrypt");
    next();
});

sessionClientSchema.methods.comparePassword = async function (inputPassword: string): Promise<boolean> {
    return await Bun.password.verify(inputPassword, this.password);
};


export const OTP = mongoose.model<IOTP>('OTP', OTPSchema)
export const Session = mongoose.model<ISession>('Session', sessionSchema);
export const SessionClient = mongoose.model<ISessionClient>('SessionClient', sessionClientSchema);
