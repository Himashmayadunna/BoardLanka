const { Resend } = require("resend");

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const fromEmail = process.env.FROM_EMAIL || "BoardLanka <onboarding@resend.dev>";

/**
 * Send transactional email with HTML layout
 */
async function sendEmail({ to, subject, html }) {
  if (!resend) {
    console.log(`[Email Service - Simulated] To: ${to} | Subject: ${subject}`);
    return { success: true, simulated: true };
  }

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Resend email delivery error:", error);
    return { success: false, error: error.message };
  }
}

// 1. Rent Due Reminder Template
function getRentReminderTemplate({ tenantName, propertyTitle, unitNumber, amount, dueDate, paymentUrl }) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b0f19; color: #f8fafc; padding: 40px 20px; line-height: 1.6;">
      <div style="max-width: 580px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
        <div style="display: flex; align-items: center; margin-bottom: 24px;">
          <span style="font-size: 24px; font-weight: 800; color: #3b82f6; letter-spacing: -0.5px;">Board<span style="color: #06b6d4;">Lanka</span></span>
          <span style="margin-left: auto; font-size: 12px; background: rgba(59, 130, 246, 0.15); color: #60a5fa; padding: 4px 10px; border-radius: 999px; border: 1px solid rgba(59, 130, 246, 0.3);">Payment Reminder</span>
        </div>
        <h2 style="font-size: 20px; font-weight: 700; margin-top: 0; color: #ffffff;">Upcoming Rent Notice</h2>
        <p style="color: #94a3b8; font-size: 15px;">Hello ${tenantName || "Valued Tenant"},</p>
        <p style="color: #cbd5e1; font-size: 15px;">This is a friendly reminder that your upcoming rental installment for <strong>${propertyTitle || "your unit"}</strong> ${unitNumber ? `(Unit ${unitNumber})` : ''} is scheduled for payment.</p>
        
        <div style="background: #1f2937; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #374151;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: #94a3b8; font-size: 14px;">Amount Due</span>
            <span style="color: #38bdf8; font-size: 18px; font-weight: 700;">LKR ${Number(amount).toLocaleString()}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #94a3b8; font-size: 14px;">Due Date</span>
            <span style="color: #f8fafc; font-size: 14px; font-weight: 600;">${dueDate}</span>
          </div>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${paymentUrl || '#'}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 15px;">Pay or Upload Receipt</a>
        </div>

        <p style="font-size: 13px; color: #64748b; border-top: 1px solid #1e293b; padding-top: 20px; margin-bottom: 0;">
          BoardLanka Property Management • Secure Tenant Portal
        </p>
      </div>
    </div>
  `;
}

// 2. Overdue Payment Alert Template
function getOverduePaymentTemplate({ tenantName, propertyTitle, unitNumber, amount, daysOverdue, paymentUrl }) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b0f19; color: #f8fafc; padding: 40px 20px;">
      <div style="max-width: 580px; margin: 0 auto; background: #111827; border: 1px solid #dc2626; border-radius: 16px; padding: 32px;">
        <h2 style="font-size: 20px; font-weight: 700; color: #f87171; margin-top: 0;">Overdue Rent Alert</h2>
        <p style="color: #cbd5e1;">Dear ${tenantName},</p>
        <p style="color: #cbd5e1;">Our records indicate that your rent payment of <strong>LKR ${Number(amount).toLocaleString()}</strong> for <strong>${propertyTitle}</strong> ${unitNumber ? `(${unitNumber})` : ''} is past due by <strong>${daysOverdue} day(s)</strong>.</p>
        <p style="color: #94a3b8;">Please settle the outstanding balance as soon as possible to avoid late fees or lease disruptions.</p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="${paymentUrl || '#'}" style="display: inline-block; background: #ef4444; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">Settle Overdue Rent</a>
        </div>
      </div>
    </div>
  `;
}

// 3. Invoice Generated Template
function getInvoiceNotificationTemplate({ tenantName, invoiceNumber, amount, dueDate, invoiceUrl }) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b0f19; color: #f8fafc; padding: 40px 20px;">
      <div style="max-width: 580px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 32px;">
        <h2 style="font-size: 20px; font-weight: 700; color: #38bdf8; margin-top: 0;">New Rental Invoice #${invoiceNumber}</h2>
        <p style="color: #cbd5e1;">Dear ${tenantName},</p>
        <p style="color: #cbd5e1;">A new rent invoice of <strong>LKR ${Number(amount).toLocaleString()}</strong> has been generated with due date <strong>${dueDate}</strong>.</p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="${invoiceUrl || '#'}" style="display: inline-block; background: #3b82f6; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">View & Download Invoice</a>
        </div>
      </div>
    </div>
  `;
}

// 4. Maintenance Ticket Update Template
function getMaintenanceUpdateTemplate({ tenantName, ticketTitle, status, message }) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b0f19; color: #f8fafc; padding: 40px 20px;">
      <div style="max-width: 580px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 32px;">
        <h2 style="font-size: 20px; font-weight: 700; color: #34d399; margin-top: 0;">Maintenance Status Update</h2>
        <p style="color: #cbd5e1;">Dear ${tenantName},</p>
        <p style="color: #cbd5e1;">Your request regarding "<strong>${ticketTitle}</strong>" has been updated to: <strong style="color: #38bdf8; text-transform: uppercase;">${status}</strong>.</p>
        ${message ? `<blockquote style="background: #1f2937; border-left: 3px solid #3b82f6; padding: 12px; margin: 15px 0; color: #e2e8f0;">${message}</blockquote>` : ''}
      </div>
    </div>
  `;
}

// 5. Lease Expiration Notice
function getLeaseExpirationTemplate({ tenantName, propertyTitle, expiryDate, landlordName }) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b0f19; color: #f8fafc; padding: 40px 20px;">
      <div style="max-width: 580px; margin: 0 auto; background: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 32px;">
        <h2 style="font-size: 20px; font-weight: 700; color: #fbbf24; margin-top: 0;">Lease Renewal Notice</h2>
        <p style="color: #cbd5e1;">Dear ${tenantName},</p>
        <p style="color: #cbd5e1;">Your rental agreement for <strong>${propertyTitle}</strong> is approaching expiration on <strong>${expiryDate}</strong>.</p>
        <p style="color: #94a3b8;">Please reach out to ${landlordName || 'your property manager'} or respond through your BoardLanka portal to discuss renewal terms.</p>
      </div>
    </div>
  `;
}

module.exports = {
  sendEmail,
  getRentReminderTemplate,
  getOverduePaymentTemplate,
  getInvoiceNotificationTemplate,
  getMaintenanceUpdateTemplate,
  getLeaseExpirationTemplate,
};
