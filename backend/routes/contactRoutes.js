const express = require("express");
const router = express.Router();

// POST /api/contact - Submit contact inquiry form
router.post("/", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "Missing required fields: name, email, and message are required" });
  }

  // Send email using Resend API if API Key is available
  if (process.env.RESEND_API_KEY) {
    try {
      const emailBody = {
        from: "BoardLanka Contact Form <onboarding@resend.dev>",
        to: "himashheshan193@gmail.com",
        subject: `[BoardLanka] New Contact Inquiry from ${name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
            <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-top: 0;">New Contact Inquiry</h2>
            <p>You have received a new message from the BoardLanka contact form:</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 5px 0;"><strong>Sender Email:</strong> ${email}</p>
              <p style="margin: 5px 0;"><strong>Message:</strong></p>
              <p style="white-space: pre-wrap; margin: 5px 0; background: #fff; padding: 10px; border: 1px solid #e5e7eb; border-radius: 4px;">${message}</p>
            </div>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
            <p style="font-size: 12px; color: #6b7280; text-align: center; margin-bottom: 0;">This is an automated message sent from BoardLanka Contact API.</p>
          </div>
        `
      };

      if (typeof fetch === "function") {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(emailBody)
        });
        const emailData = await emailRes.json();
        console.log("✓ Contact Form email response:", emailData);
      } else {
        const https = require("https");
        const payloadStr = JSON.stringify(emailBody);
        const reqOpts = {
          hostname: "api.resend.com",
          path: "/emails",
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(payloadStr)
          }
        };
        const emailReq = https.request(reqOpts, (emailRes) => {
          let body = "";
          emailRes.on("data", chunk => body += chunk);
          emailRes.on("end", () => console.log("✓ Contact Form email (https fallback) response:", body));
        });
        emailReq.on("error", (err) => console.error("✗ Failed to send contact email via https fallback:", err));
        emailReq.write(payloadStr);
        emailReq.end();
      }
    } catch (emailErr) {
      console.error("✗ Failed to send contact email notification:", emailErr.message);
    }
  } else {
    console.warn("⚠ RESEND_API_KEY not configured in backend environment");
  }

  res.status(200).json({
    message: "Your message has been sent successfully. We will get back to you soon!"
  });
});

module.exports = router;
