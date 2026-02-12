import nodemailer from "nodemailer";
import https from "https";
import dotenv from "dotenv";
dotenv.config();

// Email transporter setup (using existing configuration)
const transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 465,
    secure: true,
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASSWORD,
    },
});

/**
 * Send enrollment email notification
 * @param {string} userEmail - User's email address
 * @param {string} userName - User's name
 * @param {string} courseName - Course name
 */
const sendEnrollmentEmail = async (userEmail, userName, courseName) => {
    try {
        const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #000; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #fff; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
          .message { font-size: 16px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Enrollment Successful!</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${userName}</strong>,</p>
            <div class="message">
              <p>You are successfully enrolled in the course: <strong>${courseName}</strong></p>
              <p>You can now start learning and access all course materials.</p>
            </div>
            <p>Happy Learning! 🚀</p>
          </div>
          <div class="footer">
            <p>© 2026 E-Learning Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

        await transporter.sendMail({
            from: `"E-Learning Platform" <${process.env.USER_EMAIL}>`,
            to: userEmail,
            subject: "Course Enrollment Successful 🎉",
            html: emailHTML,
        });

        console.log(`✅ Email sent to ${userEmail}`);
        return { success: true };
    } catch (error) {
        console.error(`❌ Email error: ${error.message}`);
        return { success: false, error: error.message };
    }
};

/**
 * Send SMS notification using Fast2SMS (India)
 * @param {string} phoneNumber - User's phone number (10 digits)
 * @param {string} courseName - Course name
 */
const sendEnrollmentSMS = async (phoneNumber, courseName) => {
    try {
        const apiKey = process.env.FAST2SMS_API_KEY;

        if (!apiKey) {
            console.warn("⚠️ Fast2SMS API key not configured. Skipping SMS.");
            return { success: false, error: "API key not configured" };
        }

        // Remove +91 or any prefix, keep only 10 digits
        const cleanPhone = phoneNumber.replace(/\D/g, "").slice(-10);

        if (cleanPhone.length !== 10) {
            console.warn(`⚠️ Invalid phone number: ${phoneNumber}`);
            return { success: false, error: "Invalid phone number" };
        }

        const message = `You are successfully enrolled in ${courseName}.`;

        const postData = JSON.stringify({
            route: "q",
            message: message,
            language: "english",
            flash: 0,
            numbers: cleanPhone,
        });

        const options = {
            hostname: "www.fast2sms.com",
            port: 443,
            path: "/dev/bulkV2",
            method: "POST",
            headers: {
                "authorization": apiKey,
                "Content-Type": "application/json",
                "Content-Length": postData.length,
            },
        };

        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let data = "";
                res.on("data", (chunk) => { data += chunk; });
                res.on("end", () => {
                    try {
                        const response = JSON.parse(data);
                        if (response.return === true) {
                            console.log(`✅ SMS sent to ${cleanPhone}`);
                            resolve({ success: true });
                        } else {
                            console.error(`❌ SMS failed: ${response.message}`);
                            resolve({ success: false, error: response.message });
                        }
                    } catch (e) {
                        resolve({ success: false, error: "Invalid response" });
                    }
                });
            });

            req.on("error", (error) => {
                console.error(`❌ SMS error: ${error.message}`);
                resolve({ success: false, error: error.message });
            });

            req.write(postData);
            req.end();
        });
    } catch (error) {
        console.error(`❌ SMS error: ${error.message}`);
        return { success: false, error: error.message };
    }
};

/**
 * Main function to send all enrollment notifications
 * @param {Object} data - Notification data
 * @param {string} data.userEmail - User's email
 * @param {string} data.userName - User's name
 * @param {string} data.userPhone - User's phone number (optional)
 * @param {string} data.courseName - Course name
 */
export const sendEnrollmentNotifications = async (data) => {
    const { userEmail, userName, userPhone, courseName } = data;

    console.log("📧 Sending enrollment notifications...");

    // Send email (always attempt)
    const emailResult = await sendEnrollmentEmail(userEmail, userName, courseName);

    // Send SMS (only if phone number exists)
    let smsResult = { success: false, error: "No phone number" };
    if (userPhone && userPhone.trim()) {
        smsResult = await sendEnrollmentSMS(userPhone, courseName);
    }

    console.log("📊 Notification Status:", {
        email: emailResult.success ? "✅" : "❌",
        sms: smsResult.success ? "✅" : "❌",
    });

    return { email: emailResult, sms: smsResult };
};
