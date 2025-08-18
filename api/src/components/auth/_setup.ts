import { t } from 'elysia'

export const OTPValidator = {
    generateOTP_Email: {
        body: t.Object({
            sessionId: t.String({ minLength: 1, error: "Session ID is required" }),
        }),
        detail: {
            tags: ['OTP']
        }
    },
    verifyOTP_Email: {
        body: t.Object({
            sessionId: t.String({ minLength: 1, error: "Session ID is required" }),
            otp: t.String({ minLength: 1, error: "OTP is required" })
        }),
        detail: {
            tags: ['OTP']
        }
    }
}