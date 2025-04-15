const sgMail = require('@sendgrid/mail');
const fs = require('fs');
const path = require('path');

// Set your SendGrid API Key from environment variable
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Function to read subscribers
function getSubscribers() {
  const subscribersFile = path.join(__dirname, 'subscribers.json');
  try {
    if (fs.existsSync(subscribersFile)) {
      return JSON.parse(fs.readFileSync(subscribersFile));
    }
    return [];
  } catch (error) {
    console.error('Error reading subscribers:', error);
    return [];
  }
}

// Function to send newsletter
async function sendNewsletter(subject, content) {
  const subscribers = getSubscribers();
  
  if (subscribers.length === 0) {
    console.log('No subscribers to send to');
    return;
  }

  const msg = {
    to: subscribers,
    from: 'your-verified-sender@yourdomain.com', // Must be verified in SendGrid
    subject: subject,
    html: content,
  };

  try {
    const response = await sgMail.send(msg);
    console.log('Newsletter sent successfully:', response[0].statusCode);
    return { success: true, message: 'Newsletter sent successfully' };
  } catch (error) {
    console.error('Error sending newsletter:', error);
    return { success: false, message: error.message };
  }
}

// Example newsletter template
function createNewsletterTemplate(title, content, ctaText, ctaLink) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a1a1a; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .button { 
          display: inline-block;
          padding: 10px 20px;
          background: #6366f1;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${title}</h1>
        </div>
        <div class="content">
          ${content}
          <p>
            <a href="${ctaLink}" class="button">${ctaText}</a>
          </p>
        </div>
        <div class="footer">
          <p>You received this email because you subscribed to our newsletter.</p>
          <p>To unsubscribe, click <a href="${process.env.WEBSITE_URL}/unsubscribe">here</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = {
  sendNewsletter,
  createNewsletterTemplate
}; 