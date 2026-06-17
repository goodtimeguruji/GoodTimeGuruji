import nodemailer from "nodemailer";

export const sendMuhuratEmail = async (req, res) => {
    try {
        const { results, selectedFunction } = req.body;
            const email = req.user.email;
            console.log("Sending email to:", email);
        const transporter = nodemailer.createTransport({
            host: "smtp.hostinger.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        let html = `
      <h2>${selectedFunction} Muhurat Results</h2>
    `;

        results.forEach((item) => {
            html += `
        <hr>
        <p><strong>Date:</strong> ${item.date}</p>
        <p><strong>Nakshatra:</strong> ${item.nakshatraStr}</p>
        <p><strong>Tithi:</strong> ${item.tithiStr}</p>
        <p><strong>Yoga:</strong> ${item.yogaStr}</p>
        <p><strong>Karana:</strong> ${item.karanaStr}</p>
      `;
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: `${selectedFunction} Muhurat Results`,
            html,
        });

        res.json({
            success: true,
            message: "Email sent successfully",
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Failed to send email",
        });
    }
};