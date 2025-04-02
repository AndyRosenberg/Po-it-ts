import nodemailer from 'nodemailer';

// Create a reusable transporter object
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Send a password reset email
export const sendPasswordResetEmail = async (
  email: string, 
  resetToken: string,
  username: string
) => {
  try {
    const transporter = createTransporter();
    
    // The frontend URL where the user can reset their password
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    // Email content
    const mailOptions = {
      from: `"Po-it Support" <${process.env.EMAIL_FROM || 'support@po-it.com'}>`,
      to: email,
      subject: 'Reset Your Po-it Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #0891b2;">Po-it</h1>
            <p style="font-size: 18px; color: #666;">Password Reset</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
            <p>Hello ${username},</p>
            <p>We received a request to reset your password for your Po-it account. If you didn't make this request, you can safely ignore this email.</p>
            <p>To reset your password, click the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #0891b2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #0891b2;"><a href="${resetUrl}">${resetUrl}</a></p>
            
            <p>This password reset link will expire in 1 hour.</p>
          </div>
          
          <div style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">
            <p>If you didn't request a password reset, please ignore this email or contact support if you have questions.</p>
            <p>&copy; ${new Date().getFullYear()} Po-it. All rights reserved.</p>
          </div>
        </div>
      `,
    };
    
    // Send the email
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};