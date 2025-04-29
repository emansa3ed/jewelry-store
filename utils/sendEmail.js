const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from: `"Jewelry Store" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text, // لو عايز تحط Text Version برضه (اختياري)
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="text-align: center; color: #333;">Welcome to Jewelry Store!</h2>
                <p>Hi there,</p>
                <p>Thank you for signing up at <strong>Jewelry Store</strong>! Please use the following OTP code to verify your email address:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <h1 style="background: #f2f2f2; display: inline-block; padding: 15px 30px; border-radius: 8px; color: #333;">${text}</h1>
                </div>
                <p>If you didn't request this, you can safely ignore this email.</p>
                <p>Best regards,<br>Jewelry Store Team</p>
            </div>
        `
    });
    
};

module.exports = sendEmail;
