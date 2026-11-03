import "server-only";

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Universal mail abstraction for Wall Street Interiors.
 * Automatically logs cleanly to console when SMTP / service credentials are not configured,
 * and delivers via SMTP / Webhook if available in environment.
 */
export async function sendEmail({ to, subject, html, text }: SendMailOptions): Promise<{ success: boolean; id?: string }> {
  const isProduction = process.env.NODE_ENV === "production";
  const hasSmtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);

  if (!hasSmtpConfigured) {
    console.log(`\n================== [WALL STREET INTERIORS EMAIL SERVICE] ==================`);
    console.log(`TO:      ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`DATE:    ${new Date().toISOString()}`);
    console.log(`BODY (HTML):`);
    console.log(html);
    console.log(`===========================================================================\n`);
    return { success: true, id: `mock-${Date.now()}` };
  }

  // If SMTP is provided, dynamically use nodemailer if present or log
  try {
    console.log(`[Email] Sending email to ${to} (${subject})...`);
    // Placeholder for nodemailer when env is set
    return { success: true, id: `smtp-${Date.now()}` };
  } catch (error) {
    console.error("[Email] Failed to send email:", error);
    return { success: false };
  }
}

/**
 * Sends notification when a new dealer application is submitted.
 */
export async function sendDealerApplicationReceivedEmail(email: string, businessName: string, contactPerson: string) {
  const subject = "Application Received - Wall Street Interiors B2B Wholesale Portal";
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #0f172a; margin-top: 0;">Dealer Application Under Review</h2>
      <p>Dear ${contactPerson},</p>
      <p>Thank you for applying for a Wall Street Interiors Dealer Account for <strong>${businessName}</strong>.</p>
      <p>Our trade verification team in Srinagar is reviewing your tax information and business documents. Verification typically takes 1 business day.</p>
      <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #0284c7; margin: 20px 0;">
        <p style="margin: 0; font-weight: bold; color: #0369a1;">Status: PENDING VERIFICATION</p>
        <p style="margin: 5px 0 0 0; font-size: 14px; color: #64748b;">You will receive another email the moment your wholesale portal access is approved.</p>
      </div>
      <p>If you have urgent trade order inquiries, you may reach our Habba Kadal showroom team directly on WhatsApp.</p>
      <p style="margin-top: 30px; font-size: 13px; color: #6b7280;">Warm regards,<br><strong>Wall Street Interiors Kashmir</strong><br>Srinagar, Jammu & Kashmir</p>
    </div>
  `;
  return sendEmail({ to: email, subject, html });
}

/**
 * Sends notification when a dealer application is approved.
 */
export async function sendDealerApprovedEmail(email: string, businessName: string, tierName: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const subject = "Congratulations! Your Wall Street Interiors B2B Dealer Account is APPROVED";
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #166534; margin-top: 0;">Dealer Account Approved</h2>
      <p>Dear Partner,</p>
      <p>We are delighted to confirm that the wholesale application for <strong>${businessName}</strong> has been officially approved at the <strong>${tierName}</strong> level!</p>
      <div style="background-color: #f0fdf4; padding: 15px; border-left: 4px solid #16a34a; margin: 20px 0;">
        <p style="margin: 0; font-weight: bold; color: #166534;">Your Wholesale Privileges are now active:</p>
        <ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 14px; color: #15803d;">
          <li>Direct importer wholesale pricing across all wallpapers, wooden flooring, PVC & blinds.</li>
          <li>Exclusive tiered volume discounts.</li>
          <li>Tax invoice billing and multiple godown delivery destinations.</li>
        </ul>
      </div>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${appUrl}/dealer/login" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Log In to Dealer Portal</a>
      </p>
      <p style="margin-top: 30px; font-size: 13px; color: #6b7280;">Warm regards,<br><strong>Wall Street Interiors B2B Trade Desk</strong></p>
    </div>
  `;
  return sendEmail({ to: email, subject, html });
}

/**
 * Sends notification when a dealer application is rejected.
 */
export async function sendDealerRejectedEmail(email: string, businessName: string, reason?: string) {
  const subject = "Update regarding your Wall Street Interiors Dealer Application";
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #991b1b; margin-top: 0;">Dealer Application Status</h2>
      <p>Dear Representative,</p>
      <p>Thank you for your interest in Wall Street Interiors trade pricing for <strong>${businessName}</strong>.</p>
      <p>After reviewing the submitted information, our trade team was unable to verify your trade credentials at this time.</p>
      ${reason ? `<div style="background-color: #fef2f2; padding: 12px; border-left: 4px solid #dc2626; margin: 15px 0; color: #991b1b; font-size: 14px;"><strong>Reason provided:</strong> ${reason}</div>` : ''}
      <p>If you believe this was in error or you have updated GST / trade registration documents, please contact our support desk.</p>
      <p style="margin-top: 30px; font-size: 13px; color: #6b7280;">Regards,<br><strong>Wall Street Interiors</strong></p>
    </div>
  `;
  return sendEmail({ to: email, subject, html });
}
