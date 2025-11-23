// Email notification utility
// For production, integrate with services like SendGrid, AWS SES, or Resend

interface EmailNotificationParams {
  to: string;
  subject: string;
  message: string;
  orderNumber?: string;
  status?: string;
}

export async function sendOrderStatusEmail(params: EmailNotificationParams) {
  const { to, subject, message, orderNumber, status } = params;

  // TODO: Implement with actual email service
  // For now, just log
  console.log("📧 Email Notification:", {
    to,
    subject,
    message,
    orderNumber,
    status,
    timestamp: new Date().toISOString(),
  });

  // Example integration with Resend (uncomment when configured):
  /*
  const { Resend } = require('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: 'Online-MART <orders@onlinemart.com>',
    to: [to],
    subject: subject,
    html: `
      <div>
        <h2>${subject}</h2>
        <p>${message}</p>
        ${orderNumber ? `<p><strong>Order Number:</strong> ${orderNumber}</p>` : ''}
        ${status ? `<p><strong>Status:</strong> ${status}</p>` : ''}
        <p>Thank you for shopping with Online-MART!</p>
      </div>
    `,
  });
  */

  return {
    success: true,
    message: "Email notification logged (integration pending)",
  };
}
