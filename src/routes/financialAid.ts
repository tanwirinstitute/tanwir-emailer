import { Router, Request, Response } from 'express';
import { sendEmail, ContentBlock } from '../services/emailService';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { recipientEmail, studentName, discountPercentage, discountCode, programName, additionalDetails } = req.body;

  if (!recipientEmail || !studentName || discountPercentage === undefined || !discountCode || !programName) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const discountValue = typeof discountPercentage === 'string'
    ? parseInt(discountPercentage, 10)
    : discountPercentage as number;

  if (![25, 50, 75, 100].includes(discountValue)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid discount percentage. Must be 25, 50, 75, or 100.',
    });
  }

  const blocks: ContentBlock[] = [
    { type: 'heading', text: 'Financial Aid Approval' },
    { type: 'paragraph', text: `Asalamu alaikum ${studentName},` },
    {
      type: 'paragraph',
      text: `We are pleased to inform you that your application for financial aid for the <strong>${programName}</strong> has been <strong>approved</strong>.`,
    },
    { type: 'highlight', label: 'You have been awarded', value: `${discountValue}% award` },
    {
      type: 'code',
      label: 'Your Discount Code',
      code: discountCode,
      hint: `Use this code during checkout to receive your ${discountValue}% award`,
    },
    {
      type: 'steps',
      title: 'How to Use Your Discount Code:',
      items: [
        'Visit our website and select your program',
        'Proceed to checkout',
        'Enter the discount code in the "Gift or Discount Code" field',
        'Complete your registration',
      ],
    },
    ...(additionalDetails
      ? [{ type: 'paragraph' as const, text: `<strong>Additional Information:</strong> ${additionalDetails}` }]
      : []),
    {
      type: 'paragraph',
      text: 'This discount code will expire in 14 days. Please complete your registration before then to secure your place in the program.',
    },
    {
      type: 'paragraph',
      text: 'If you have any questions regarding your financial aid package, please contact our Programs Office at <a href="mailto:programs@tanwirinstitute.org">programs@tanwirinstitute.org</a>.',
    },
    { type: 'paragraph', text: 'Congratulations again on your award!' },
    { type: 'paragraph', text: 'Sincerely,<br><strong>The Financial Aid Committee</strong><br>Tanwir Institute' },
  ];

  try {
    await sendEmail({
      to: { email: recipientEmail, name: studentName },
      subject: 'Congratulations! Your Financial Aid Application Has Been Approved',
      blocks,
    });
    return res.status(200).json({ success: true, message: 'Financial aid acceptance email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ success: false, message: 'Failed to send email', error: (error as Error).message });
  }
});

export default router;
