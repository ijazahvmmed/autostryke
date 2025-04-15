const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { sendNewsletter, createNewsletterTemplate } = require('./newsletter');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.')));

// Newsletter subscription endpoint
app.post('/api/subscribe', (req, res) => {
  const { email } = req.body;
  
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Please provide a valid email address' });
  }

  // Store email in a JSON file
  const subscribersFile = path.join(__dirname, 'subscribers.json');
  let subscribers = [];
  
  try {
    if (fs.existsSync(subscribersFile)) {
      subscribers = JSON.parse(fs.readFileSync(subscribersFile));
    }
  } catch (error) {
    console.error('Error reading subscribers file:', error);
  }

  // Check if email already exists
  if (subscribers.includes(email)) {
    return res.status(400).json({ error: 'Email already subscribed' });
  }

  // Add new subscriber
  subscribers.push(email);
  
  try {
    fs.writeFileSync(subscribersFile, JSON.stringify(subscribers, null, 2));
    res.json({ message: 'Successfully subscribed to newsletter!' });
  } catch (error) {
    console.error('Error saving subscriber:', error);
    res.status(500).json({ error: 'Failed to save subscription' });
  }
});

// Get subscribers endpoint
app.get('/api/subscribers', (req, res) => {
  const subscribersFile = path.join(__dirname, 'subscribers.json');
  try {
    if (fs.existsSync(subscribersFile)) {
      const subscribers = JSON.parse(fs.readFileSync(subscribersFile));
      res.json(subscribers);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error reading subscribers:', error);
    res.status(500).json({ error: 'Failed to read subscribers' });
  }
});

// Send newsletter endpoint
app.post('/api/send-newsletter', async (req, res) => {
  const { subject, content, ctaText, ctaLink } = req.body;
  
  if (!subject || !content) {
    return res.status(400).json({ error: 'Subject and content are required' });
  }

  try {
    const newsletterContent = createNewsletterTemplate(
      subject,
      content,
      ctaText || 'Learn More',
      ctaLink || process.env.WEBSITE_URL || 'https://automation-agency-rho.vercel.app'
    );

    const result = await sendNewsletter(subject, newsletterContent);
    res.json(result);
  } catch (error) {
    console.error('Error sending newsletter:', error);
    res.status(500).json({ error: 'Failed to send newsletter' });
  }
});

// Serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'landing.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 