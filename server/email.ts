import { TransactionalEmailsApi, SendSmtpEmail } from '@getbrevo/brevo';

const apiInstance = new TransactionalEmailsApi();

// Configure API key
apiInstance.setApiKey(0, process.env.BREVO_API_KEY || '');

export interface EmailOptions {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  if (!process.env.BREVO_API_KEY) {
    throw new Error('BREVO_API_KEY is not configured');
  }

  const sendSmtpEmail = new SendSmtpEmail();
  
  sendSmtpEmail.to = [{ email: options.to }];
  sendSmtpEmail.sender = { 
    email: 'noreply@gmail.com', 
    name: 'Stockit - Salon Management' 
  };
  sendSmtpEmail.subject = options.subject;
  sendSmtpEmail.htmlContent = options.htmlContent;
  sendSmtpEmail.textContent = options.textContent || options.htmlContent.replace(/<[^>]*>/g, '');

  try {
    console.log('Attempting to send email to:', options.to);
    console.log('Using sender:', sendSmtpEmail.sender);
    console.log('BREVO_API_KEY configured:', !!process.env.BREVO_API_KEY);
    
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('Email sent successfully to:', options.to);
    console.log('Brevo response:', result);
  } catch (error) {
    console.error('Failed to send email:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    // Fallback to console logging if email fails
    console.log('\n=== EMAIL FALLBACK ===');
    console.log('To:', options.to);
    console.log('Subject:', options.subject);
    console.log('Content:', options.textContent || options.htmlContent);
    console.log('======================\n');
    
    throw new Error('Failed to send email');
  }
}

export function generatePasswordResetEmail(resetToken: string, userEmail: string): EmailOptions {
  // Use the current domain from environment - render compatible
  const baseUrl = process.env.FRONTEND_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:5000';
  const resetUrl = `${baseUrl}/auth?token=${resetToken}`;
  
  console.log('Generated reset URL:', resetUrl);
  
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - Stockit</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 14px; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🔒 Reset Your Password</h1>
            <p>Stockit - Professional Salon Stock Management</p>
        </div>
        <div class="content">
            <p>Hello,</p>
            <p>We received a request to reset your password for your Stockit account. If you made this request, click the button below to set a new password:</p>
            
            <a href="${resetUrl}" class="button">Reset My Password</a>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px; font-family: monospace;">${resetUrl}</p>
            
            <p><strong>This link will expire in 1 hour</strong> for security reasons.</p>
            
            <p>If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            
            <p>Need help? Contact your salon administrator for assistance.</p>
        </div>
        <div class="footer">
            <p>This email was sent from Stockit Salon Management System</p>
            <p>© 2025 Stockit - All rights reserved</p>
        </div>
    </body>
    </html>
  `;

  const textContent = `
    Reset Your Password - Stockit

    Hello,

    We received a request to reset your password for your Stockit account. If you made this request, visit the following link to set a new password:

    ${resetUrl}

    This link will expire in 1 hour for security reasons.

    If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.

    Need help? Contact your salon administrator for assistance.

    ---
    This email was sent from Stockit Salon Management System
    © 2025 Stockit - All rights reserved
  `;

  return {
    to: userEmail,
    subject: 'Reset Your Password - Stockit',
    htmlContent,
    textContent
  };
}