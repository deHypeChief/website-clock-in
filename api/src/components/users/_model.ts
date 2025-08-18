import mongoose from 'mongoose';

export interface IUser {
    sessionClientId: mongoose.Types.ObjectId;
    phoneNumber?: string;
    dateOfBirth?: Date;
    username: string;
    gender: "male" | "female" | "other";
    address: string,
    socialInfo: {
        twitter?: string;
        instagram?: string;
    }
}

const userSchema = new mongoose.Schema<IUser>({
    sessionClientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SessionClient',
    },
    username: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
    },
    dateOfBirth: {
        type: Date,
    },
    gender: {
        type: String,
        enum: ["male", "female", "other", "notSpecified"],
        required: true,
    },
    address: {
        type: String,
        default: ""
    },
    socialInfo: {
        twitter: {
            type: String,
            default: ""
        },
        instagram: {
            type: String,
            default: ""
        }
    }

}, { timestamps: true });

export const User = mongoose.model<IUser>('User', userSchema);
