"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Create Express app
const app = (0, express_1.default)();
// Configure CORS
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Financial aid acceptance email endpoint
app.post('/send-financial-aid-email', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { recipientEmail, studentName, discountPercentage, discountCode, programName, additionalDetails } = req.body;
        // Validate required fields
        if (!recipientEmail || !studentName || discountPercentage === undefined || !discountCode || !programName) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }
        // Convert discountPercentage to number if it's a string
        const discountValue = typeof discountPercentage === 'string'
            ? parseInt(discountPercentage, 10)
            : discountPercentage;
        // Validate discount percentage (must be 25, 50, 75, or 100)
        if (![25, 50, 75, 100].includes(discountValue)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid discount percentage. Must be 25, 50, 75, or 100.'
            });
        }
        // Create email HTML content
        const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://images.squarespace-cdn.com/content/66a00d45db79b1271d17284d/f596f1b5-33ae-4fde-b6e1-3a6c9beb0deb/tanwir-horizontal.png" alt="Tanwir Institute Logo" style="max-width: 300px; height: auto;">
        </div>
        <h2 style="color: #2c3e50; text-align: center;">Financial Aid Approval</h2>
        <p>Asalamu alaikum ${studentName},</p>
        <p>We are pleased to inform you that your application for financial aid for the <strong>${programName}</strong> has been <strong>approved</strong>.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="font-size: 18px; text-align: center;">
            You have been awarded a <strong style="color: #28a745;">${discountValue}% award</strong>
          </p>
        </div>
        
        <div style="background-color: #e9f7fe; padding: 20px; border-radius: 5px; margin: 25px 0; text-align: center; border: 1px dashed #0078d4;">
          <p style="margin: 0; font-size: 16px;">Your Discount Code:</p>
          <h3 style="margin: 10px 0; font-size: 24px; letter-spacing: 2px; color: #0078d4; font-weight: bold;">${discountCode}</h3>
          <p style="margin: 0; font-size: 14px;">Use this code during checkout to receive your ${discountValue}% award</p>
        </div>

        <h3>How to Use Your Discount Code:</h3>
        <ol style="margin-left: 20px; line-height: 1.5;">
          <li>Visit our website and select your program</li>
          <li>Proceed to checkout</li>
          <li>Enter the discount code in the "Gift or Discount Code" field</li>
          <li>Complete your registration</li>
        </ol>

        ${additionalDetails ? `<p><strong>Additional Information:</strong> ${additionalDetails}</p>` : ''}
        
        <p>This discount code will expire in 14 days. Please complete your registration before then to secure your place in the program.</p>
        
        <p>If you have any questions regarding your financial aid package, please contact our Programs Office at <a href="mailto:programs@tanwirinstitute.org">programs@tanwirinstitute.org</a>.</p>
        
        <p>Congratulations again on your award!</p>
        <p>Sincerely,</p>
        <p><strong>The Financial Aid Committee</strong><br>Tanwir Institute</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #6c757d; text-align: center;">
          This is an automated email. Please direct any questions to programs@tanwirinstitute.org.
        </p>
      </div>
    `;
        // Prepare the Brevo API request payload
        const brevoPayload = {
            sender: {
                name: process.env.SENDER_NAME || 'Tanwir Financial Aid',
                email: process.env.SENDER_EMAIL || 'noreply@tanwirinstitute.org'
            },
            to: [
                {
                    email: recipientEmail,
                    name: studentName
                }
            ],
            subject: 'Congratulations! Your Financial Aid Application Has Been Approved',
            htmlContent: htmlContent
        };
        // Send email using Brevo API
        const response = yield axios_1.default.post('https://api.brevo.com/v3/smtp/email', brevoPayload, {
            headers: {
                'Content-Type': 'application/json',
                'api-key': process.env.BREVO_API_KEY || ''
            }
        });
        // Return success response
        return res.status(200).json({
            success: true,
            message: 'Financial aid acceptance email sent successfully',
            brevoResponse: response.data
        });
    }
    catch (error) {
        console.error('Error sending email:', error);
        // Handle Axios errors specifically
        if (axios_1.default.isAxiosError(error)) {
            return res.status(((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) || 500).json({
                success: false,
                message: 'Failed to send email via Brevo API',
                error: ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message
            });
        }
        // Handle other errors
        return res.status(500).json({
            success: false,
            message: 'Failed to send email',
            error: error.message
        });
    }
}));
// Health check endpoint
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
