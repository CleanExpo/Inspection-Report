import nodemailer from 'nodemailer';

interface EmailData {
  to: string;
  jobNumber: string;
  clientName: string;
  inspectorName: string;
  pdfUrl: string;
}

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendReportEmail({
  to,
  jobNumber,
  clientName,
  inspectorName,
  pdfUrl,
}: EmailData): Promise<boolean> {
  try {
    const info = await transporter.sendMail({
      from: `"Inspection Reports" <${process.env.EMAIL_FROM}>`,
      to,
      subject: `Inspection Report - Job ${jobNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Inspection Report</h2>
          
          <p>Dear ${clientName},</p>
          
          <p>Please find attached your inspection report for job number ${jobNumber}.</p>
          
          <div style="margin: 20px 0; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
            <p style="margin: 0;"><strong>Job Number:</strong> ${jobNumber}</p>
            <p style="margin: 10px 0;"><strong>Inspector:</strong> ${inspectorName}</p>
            <p style="margin: 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <p>You can access your report using the link below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${pdfUrl}" 
               style="background-color: #3498db; 
                      color: white; 
                      padding: 12px 25px; 
                      text-decoration: none; 
                      border-radius: 5px;
                      display: inline-block;">
              Download Report
            </a>
          </div>
          
          <p>If you have any questions about your report, please don't hesitate to contact us.</p>
          
          <p style="margin-top: 30px;">Best regards,<br>${inspectorName}</p>
          
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            <p>This is an automated email. Please do not reply directly to this message.</p>
          </div>
        </div>
      `,
    });

    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Verify email configuration on startup
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('Email service is ready');
    return true;
  } catch (error) {
    console.error('Email service configuration error:', error);
    return false;
  }
}
