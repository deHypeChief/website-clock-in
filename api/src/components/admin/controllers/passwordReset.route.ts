import Elysia, { t } from "elysia";
import ErrorHandler from "../../../services/errorHandler.service";
import SuccessHandler from "../../../services/successHandler.service";
import { SessionClient } from "../../auth/_model";
import { generateOTP, verifyOTP } from "../../../services/otpHandler.service";
import passwordResetEmail from "../../../emails/passwordReset.template";

const passwordReset = new Elysia()
  // Request reset (send OTP)
  .post("/password/reset/request", async ({ set, body }) => {
    try {
      const { email } = body;
      const client = await SessionClient.findOne({ email });
      if (!client) return ErrorHandler.ValidationError(set, "If that email exists, a code was sent");

      const otp = await generateOTP(client._id, "password_reset");
      if (!otp) return ErrorHandler.ValidationError(set, "Please wait before requesting another code");

      // Override email content for password reset
      await passwordResetEmail({ name: client.fullName, otp: otp.token });

      return SuccessHandler(set, "Password reset code sent", { email });
    } catch (error) {
      return ErrorHandler.ServerError(set, "Error requesting password reset");
    }
  }, {
    body: t.Object({ email: t.String({ format: 'email' }) })
  })
  // Verify OTP & set new password
  .post("/password/reset/confirm", async ({ set, body }) => {
    try {
      const { email, otp, newPassword } = body;
      const client = await SessionClient.findOne({ email });
      if (!client) return ErrorHandler.ValidationError(set, "Invalid code or email");

      const valid = await verifyOTP(client._id, "password_reset", otp);
      if (!valid.valid) return ErrorHandler.ValidationError(set, valid.message || "Invalid or expired code");

      client.password = newPassword;
      await client.save();

      return SuccessHandler(set, "Password updated successfully");
    } catch (error) {
      return ErrorHandler.ServerError(set, "Error resetting password");
    }
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      otp: t.String({ minLength: 6, maxLength: 6 }),
      newPassword: t.String({ minLength: 6 })
    })
  });

export default passwordReset;
