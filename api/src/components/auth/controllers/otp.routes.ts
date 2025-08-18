import Elysia from "elysia";
import ErrorHandler from "../../../services/errorHandler.service";
import SuccessHandler from "../../../services/successHandler.service";
import { generateOTP, verifyOTP } from "../../../services/otpHandler.service";
import { SessionClient } from "../_model";
import { OTPValidator } from "../_setup";
import { ObjectId, Types } from "mongoose";

const manageOTP = new Elysia()
    .post("/otp/generate/email", async ({
        set,
        body: { sessionId }
    }) => {
        try {

            const client = await SessionClient.findOne({
                _id: sessionId,
                isEmailVerified: true
            })

            if(client){
                return ErrorHandler.ValidationError(
                    set,
                    `${client.email} is already verifyed`
                );
            }


            const otp = await generateOTP(
                new Types.ObjectId(sessionId),
                "email_verification"
            )

            if (!otp) {
                return ErrorHandler.ValidationError(
                    set,
                    "You have reached the limit of OTP requests. Please wait for 60 seconds"
                );
            }

            return SuccessHandler(
                set,
                `OTP has been sent to ${otp.email}`,
                {
                    exp: otp.expiresAt,
                    purpose: otp.purpose,
                    email: otp.email
                },
                true
            )
        } catch (error) {
            return ErrorHandler.ServerError(
                set,
                "Error generating an OTP",
                error
            );
        }
    }, OTPValidator.generateOTP_Email)
    .post("/otp/verify/email", async ({
        set,
        body: {
            sessionId,
            otp
        }
    }) => {
        try {
            const cleint = await SessionClient.findOne({
                _id: sessionId
            })

            if (!cleint) {
                return ErrorHandler.ValidationError(
                    set,
                    "Invalid OTP or client"
                );
            }

            const isVerifyed = await verifyOTP(
                new Types.ObjectId(sessionId),
                "email_verification",
                otp
            )

            if (!isVerifyed.valid) {
                return ErrorHandler.ValidationError(
                    set,
                    isVerifyed.message as string
                )
            }


            cleint.isEmailVerified = true;
            await cleint.save()

            return SuccessHandler(
                set,
                "The given OTP is valid",
                isVerifyed,
                true
            )
        } catch (error) {
            return ErrorHandler.ServerError(
                set,
                "Error verifying the given OTP",
                error
            );
        }
    }, OTPValidator.verifyOTP_Email)

export default manageOTP