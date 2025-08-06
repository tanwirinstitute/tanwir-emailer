import express, { Request, Response } from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define types for email request
interface FinancialAidEmailRequest {
  recipientEmail: string;
  studentName: string;
  discountPercentage: number | string; // Allow both number and string types
  discountCode: string;
  programName: string;
  additionalDetails?: string;
}

// Create Express app
const app = express();
// Configure CORS
app.use(cors());
app.use(express.json());

// Financial aid acceptance email endpoint
app.post('/send-financial-aid-email', async (req: Request, res: Response) => {
  try {
    const { 
      recipientEmail, 
      studentName, 
      discountPercentage, 
      discountCode,
      programName,
      additionalDetails 
    } = req.body as FinancialAidEmailRequest;
    
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
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      brevoPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.BREVO_API_KEY || ''
        }
      }
    );

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Financial aid acceptance email sent successfully',
      brevoResponse: response.data
    });
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Handle Axios errors specifically
    if (axios.isAxiosError(error)) {
      return res.status(error.response?.status || 500).json({
        success: false,
        message: 'Failed to send email via Brevo API',
        error: error.response?.data || error.message
      });
    }
    
    // Handle other errors
    return res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: (error as Error).message
    });
  }
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
