import nodemailer from "nodemailer";

const createTransporter = () => nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
    }
});

export const sendOTPEmail = async (email, otp) => {

    const transporter = createTransporter();

    try {
        
        await transporter.sendMail({
            from: `"ClientPitch AI" <${process.env.EMAIL}>`,
            to: email,
            subject: "Your Password Reset OTP",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #1e3a8a;">Password Reset Request</h2>
                    <p>You requested an OTP to reset your password for ClientPitch AI.</p>
                    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e3a8a;">${otp}</span>
                    </div>
                    <p>This OTP is valid for 3 minutes. If you did not request this, please ignore this email.</p>
                </div>
            `
        });
        console.log("OTP sent successfully to:", email);
    } catch (error) {
        console.error("Nodemailer Error Details:", error.message);
        throw new Error(error.message || "Failed to send email");
    }
};

export const sendContactEmail = async ({ name, email, subject, message }) => {
    const transporter = createTransporter();
    const safeSubject = subject?.trim() || "New Contact Message";

    try {
        await transporter.sendMail({
            from: `"ClientPitch AI Contact" <${process.env.EMAIL}>`,
            to: process.env.CONTACT_RECEIVER_EMAIL || process.env.EMAIL,
            replyTo: email,
            subject: `ClientPitch AI Contact: ${safeSubject}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #1e3a8a;">New Contact Message</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Subject:</strong> ${safeSubject}</p>
                    <div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px;">
                        <p style="white-space: pre-line; margin: 0;">${message}</p>
                    </div>
                </div>
            `
        });
    } catch (error) {
        console.error("Contact Email Error:", error.message);
        throw new Error(error.message || "Failed to send contact email");
    }
};
