import mongoose from "mongoose";
import { OTP, SessionClient } from "../components/auth/_model";
import EmailHandler from "./emailHandler.service";
import { verifyOtpEmail } from "../emails/verifyEmailOtp.template";

export async function canSendOTP(sessionId: mongoose.Types.ObjectId, purpose: "email_verification" | "2fa" | "password_reset") {
    const oneMinsAgo = new Date(Date.now() - 60 * 1000);
    const count = await OTP.countDocuments({
        sessionId,
        purpose,
        createdAt: { $gte: oneMinsAgo }
    });
    return count < 1
}

export async function generateOTP(
    sessionId: mongoose.Types.ObjectId,
    purpose: "email_verification" | "2fa" | "password_reset"
) {
    const canSend = await canSendOTP(sessionId, purpose)
    if (!canSend) {
        return false
    }

    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10mins

    // Invalidate other OTPs before creating new ones
    await OTP.updateMany(
        { sessionId, purpose, used: false },
        { $set: { used: true } }
    );

    const client = await SessionClient.findById(sessionId)

    if (!client) {
        throw new Error("Email not found")
    }

    EmailHandler.send(
        client.email,
        "Verify Your Email",
        await verifyOtpEmail({
            name: client.fullName,
            otp: token
        })
    )

    await OTP.create({
        sessionId,
        purpose,
        token,
        expiresAt
    })

    return {
        token,
        purpose,
        expiresAt,
        email: client.email
    }
}

export async function verifyOTP(
    sessionId: mongoose.Types.ObjectId,
    purpose: "email_verification" | "2fa" | "password_reset",
    inputOtp: string
) {
    const record = await OTP.findOne({
        sessionId,
        token: inputOtp,
        purpose,
        used: false
    });

    if (!record) return { valid: false, message: 'Invalid or used OTP' };
    if (new Date() > record.expiresAt) return { valid: false, message: 'OTP expired' };

    record.used = true;
    await record.save();

    return { valid: true };
}