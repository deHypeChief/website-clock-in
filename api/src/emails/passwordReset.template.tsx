interface PasswordResetProps {
  name: string;
  otp: string;
}

export const passwordResetEmail = async ({ name, otp }: PasswordResetProps) => {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#222">
      <h2>Password Reset Request</h2>
      <p>Hi ${name.split(' ')[0]},</p>
      <p>We received a request to reset your password. Use the OTP below to proceed. This code expires in 10 minutes.</p>
      <p style="font-size:24px;font-weight:bold;letter-spacing:4px;">${otp}</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <p style="margin-top:32px;font-size:12px;color:#666">Do not share this code with anyone.</p>
    </div>
  `;
};

export default passwordResetEmail;
