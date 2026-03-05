import Certificate from "../models/certificateModel.js";
import AssignmentSubmission from "../models/assignmentSubmissionModel.js";
import Course from "../models/courseModel.js";
import User from "../models/userModel.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate and download certificate
export const generateCertificate = async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.userId;

        // Get student details
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Get course details
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // SECURITY CHECK: Course creator cannot get certificate
        if (course.creator.toString() === studentId.toString()) {
            return res.status(403).json({
                message: "Course creators are not eligible for certificates"
            });
        }

        // Find assignment submission for this course
        const assignment = await AssignmentSubmission.findOne({
            courseId,
            studentId
        });

        if (!assignment) {
            return res.status(404).json({
                message: "No assignment submission found. Please complete the assignment first."
            });
        }

        // Check if score >= 40
        if (assignment.score < 40) {
            return res.status(400).json({
                message: "Certificate is only available for scores >= 40%. Your current score: " + assignment.score
            });
        }

        // Check if certificate already exists
        const existingCertificate = await Certificate.findOne({
            courseId,
            studentId
        });

        if (existingCertificate) {
            // Certificate exists, regenerate and send it
            return await sendCertificatePDF(res, existingCertificate);
        }

        // Generate unique certificate ID
        const certificateId = `CERT-${courseId}-${studentId}-${Date.now()}`;

        // Create certificate record
        const certificate = new Certificate({
            courseId,
            studentId,
            certificateId,
            studentName: student.name,
            courseTitle: course.title,
            score: assignment.score,
            totalMarks: assignment.totalMarks,
            percentage: ((assignment.score / assignment.totalMarks) * 100).toFixed(2),
        });

        await certificate.save();

        // Generate and send PDF
        return await sendCertificatePDF(res, certificate);

    } catch (error) {
        console.error("Certificate generation error:", error);
        return res.status(500).json({
            message: `Failed to generate certificate: ${error.message}`,
        });
    }
};

// Helper function to generate and send PDF
const sendCertificatePDF = async (res, certificate) => {
    try {

        const tempDir = path.join(__dirname, "..", "temp");
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const filePath = path.join(tempDir, `certificate_${certificate.certificateId}.pdf`);

        const doc = new PDFDocument({
            layout: "landscape",
            size: "A4",
            margins: {
                top: 40,
                bottom: 40,
                left: 40,
                right: 40,
            },
        });

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;

        // Proper centered container
        const containerWidth = pageWidth * 0.8;
        const containerX = (pageWidth - containerWidth) / 2;

        // Decorative borders
        doc.lineWidth(6);
        doc.rect(20, 20, pageWidth - 40, pageHeight - 40).stroke("#1e40af");

        doc.lineWidth(2);
        doc.rect(30, 30, pageWidth - 60, pageHeight - 60).stroke("#3b82f6");

        let y = 100;

        // Title
        doc
            .fontSize(36)
            .font("Helvetica-Bold")
            .fillColor("#1e3a8a")
            .text("CERTIFICATE", containerX, y, {
                width: containerWidth,
                align: "center",
            });

        y += 40;

        doc
            .fontSize(24)
            .font("Helvetica")
            .fillColor("#374151")
            .text("OF COMPLETION", containerX, y, {
                width: containerWidth,
                align: "center",
            });

        y += 60;

        doc
            .fontSize(16)
            .fillColor("#6b7280")
            .text("This is to certify that", containerX, y, {
                width: containerWidth,
                align: "center",
            });

        y += 40;

        doc
            .fontSize(28)
            .font("Helvetica-Bold")
            .fillColor("#1e40af")
            .text(certificate.studentName, containerX, y, {
                width: containerWidth,
                align: "center",
            });

        y += 50;

        doc
            .fontSize(16)
            .font("Helvetica")
            .fillColor("#374151")
            .text("has successfully completed the course", containerX, y, {
                width: containerWidth,
                align: "center",
            });

        y += 40;

        doc
            .fontSize(22)
            .font("Helvetica-Bold")
            .fillColor("#1e40af")
            .text(certificate.courseTitle, containerX, y, {
                width: containerWidth,
                align: "center",
            });

        y += 40;

        doc
            .fontSize(16)
            .fillColor("#374151")
            .text(
                `Assignment Score: ${certificate.score} / ${certificate.totalMarks} (${certificate.percentage}%)`,
                containerX,
                y,
                {
                    width: containerWidth,
                    align: "center",
                }
            );

        y += 40;

        const issueDate = new Date(certificate.issuedDate);
        const formattedDate = issueDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

        doc
            .fontSize(14)
            .fillColor("#6b7280")
            .text(`Issued on: ${formattedDate}`, containerX, y, {
                width: containerWidth,
                align: "center",
            });

        y += 30;

        doc
            .fontSize(12)
            .fillColor("#6b7280")
            .text(`Certificate ID: ${certificate.certificateId}`, containerX, y, {
                width: containerWidth,
                align: "center",
            });

        y += 40;

        doc
            .fontSize(20)
            .font("Helvetica-Bold")
            .fillColor("#1e40af")
            .text("E-Learning Platform", containerX, y, {
                width: containerWidth,
                align: "center",
            });

        doc.end();

        await new Promise((resolve, reject) => {
            stream.on("finish", resolve);
            stream.on("error", reject);
        });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="Certificate_${certificate.studentName.replace(/\s+/g, "_")}.pdf"`
        );

        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

        fileStream.on("close", () => {
            setTimeout(() => {
                fs.unlink(filePath, () => { });
            }, 1000);
        });

    } catch (error) {
        console.error("PDF generation error:", error);
        throw error;
    }
};

// Check certificate eligibility
export const checkCertificateEligibility = async (req, res) => {
    try {
        const { courseId } = req.params;
        const studentId = req.userId;

        // Find assignment submission
        const submission = await AssignmentSubmission.findOne({
            courseId,
            studentId
        });

        if (!submission) {
            return res.status(404).json({
                eligible: false,
                message: "No assignment submission found"
            });
        }

        const isEligible = submission.score >= 40;

        // Check if certificate already exists
        const existingCertificate = await Certificate.findOne({
            courseId,
            studentId
        });

        return res.status(200).json({
            eligible: isEligible,
            score: submission.score,
            totalMarks: submission.totalMarks,
            percentage: ((submission.score / submission.totalMarks) * 100).toFixed(2),
            hasCertificate: !!existingCertificate,
            message: isEligible
                ? "You are eligible for certificate"
                : "Score must be at least 40% to get certificate",
        });

    } catch (error) {
        console.error("Eligibility check error:", error);
        return res.status(500).json({
            message: `Failed to check eligibility: ${error.message}`,
        });
    }
};
