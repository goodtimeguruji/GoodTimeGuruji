import nodemailer from "nodemailer";

function formatDate(dateStr) {
  if (!dateStr) return "-";

  const [year, month, day] = dateStr.split("-");
  return `${day}-${month}-${year}`;
}

function extractTime(dateTime) {
  if (!dateTime) return "";

  if (dateTime.includes("T")) {
    return dateTime.split("T")[1];
  }

  if (dateTime.includes(" ")) {
    return dateTime.split(" ")[1];
  }

  return dateTime;
}

function formatTimeRanges(timerange = []) {
  if (!timerange.length) {
    return "No valid time intervals";
  }

  return timerange
    .map(
      (t) =>
        `${extractTime(t.start_time)} - ${extractTime(t.end_time)}`
    )
    .join("<br>");
}

export const sendMuhuratEmail = async (req, res) => {
  try {
    const { results = [], selectedFunction = "Muhurat" } = req.body;

    const email = req.user?.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "User email not found",
      });
    }

    if (!results.length) {
      return res.status(400).json({
        success: false,
        message: "No Muhurat results available",
      });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const bestResult = results[0];
    const alternativeResults = results.slice(1);

    let html = `
      <p>Dear User,</p>

      <p>
        Please find below the recommended Muhurat timings for
        <strong>${selectedFunction}</strong>.
      </p>

      <h3>Best Muhurat</h3>

      <p>
        <strong>Date:</strong> ${formatDate(bestResult.date)}<br>
        <strong>Day:</strong> ${bestResult.wara || "-"}<br>
        <strong>Time:</strong><br>
        ${formatTimeRanges(bestResult.timerange)}<br><br>

        <strong>Nakshatra:</strong> ${bestResult.nakshatraStr || "-"}<br>
        <strong>Tithi:</strong> ${bestResult.tithiStr || "-"}<br>
        <strong>Yoga:</strong> ${bestResult.yogaStr || "-"}<br>
        <strong>Karana:</strong> ${bestResult.karanaStr || "-"}
      </p>
    `;

    if (alternativeResults.length) {
      html += `<h3>Next Best Muhurat Timings</h3>`;

      alternativeResults.forEach((item, index) => {
        html += `
          <p>
            <strong>Option ${index + 1}</strong><br><br>

            <strong>Date:</strong> ${formatDate(item.date)}<br>
            <strong>Day:</strong> ${item.wara || "-"}<br>
            <strong>Time:</strong><br>
            ${formatTimeRanges(item.timerange)}<br><br>

            <strong>Nakshatra:</strong> ${item.nakshatraStr || "-"}<br>
            <strong>Tithi:</strong> ${item.tithiStr || "-"}<br>
            <strong>Yoga:</strong> ${item.yogaStr || "-"}<br>
            <strong>Karana:</strong> ${item.karanaStr || "-"}
          </p>

          <hr>
        `;
      });
    }

    html += `
      <p>
        These recommendations are based on traditional
        Muhurat calculations.
      </p>

      <p>
        Regards,<br>
        Good Time Guruji
      </p>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `${selectedFunction} Muhurat Recommendations`,
      html,
    });

    return res.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Email Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send email",
    });
  }
};