require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.warn('MONGODB_URI not set. Backend will start but DB operations will fail until you configure it.');
}

mongoose
  .connect(mongoUri, { dbName: process.env.MONGODB_DB || 'hacktrackr' })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err.message));

// Schemas
const quizSchema = new mongoose.Schema(
  {
    quizName: String,
    platform: String,
    datetime: Date,
    topic: String,
    notes: String,
    reminderEnabled: Boolean,
    score: String,
    email: String, // email to notify
    completed: Boolean,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Quiz = mongoose.model('Quiz', quizSchema);

// HackathonEvent Schema
const deadlineSchema = new mongoose.Schema({
  id: String,
  type: String,
  datetime: Date,
  reminderEnabled: Boolean,
  reminderOffsets: [Number],
  notes: String,
  completed: Boolean,
  lastReminderSent: Date, // Track when last reminder was sent
});

const hackathonEventSchema = new mongoose.Schema(
  {
    title: String,
    sourcePlatform: String,
    organizer: String,
    mode: String,
    teamSizeMin: Number,
    teamSizeMax: Number,
    tags: [String],
    registrationLink: String,
    submissionLink: String,
    description: String,
    prizePool: String,
    status: String,
    deadlines: [deadlineSchema],
    checklist: [mongoose.Schema.Types.Mixed],
    result: mongoose.Schema.Types.Mixed,
    email: String, // email to notify for reminders
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const HackathonEvent = mongoose.model('HackathonEvent', hackathonEventSchema);

// API routes
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Backend running' });
});

// Quizzes CRUD
app.get('/api/quizzes', async (req, res) => {
  const quizzes = await Quiz.find().sort({ createdAt: -1 });
  res.json(quizzes);
});

app.post('/api/quizzes', async (req, res) => {
  try {
    const quiz = new Quiz(req.body);
    await quiz.save();
    res.status(201).json(quiz);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(quiz);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/quizzes/:id', async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Events CRUD
app.get('/api/events', async (req, res) => {
  try {
    const events = await HackathonEvent.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    const event = new HackathonEvent(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/events/:id', async (req, res) => {
  try {
    const event = await HackathonEvent.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    await HackathonEvent.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Email setup
const transporter =
  process.env.EMAIL_HOST &&
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

async function sendReminderEmail(to, subject, text) {
  if (!transporter) {
    console.warn('Email transport not configured; skipping email.');
    return false;
  }
  if (!to) return false;

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: to,
    subject: subject,
    text: text,
    html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">${subject}</h2>
      <p style="color: #666; line-height: 1.6;">${text.replace(/\n/g, '<br>')}</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">This is an automated reminder from HackTrackr Hub.</p>
    </div>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Reminder email sent to', to);
    return true;
  } catch (err) {
    console.error('Error sending reminder email:', err.message);
    return false;
  }
}

async function sendQuizReminder(quiz) {
  const subject = `Reminder: ${quiz.quizName} quiz coming up`;
  const text = `Your quiz "${quiz.quizName}" on topic "${quiz.topic}" is scheduled at ${new Date(quiz.datetime).toLocaleString()}.`;
  return await sendReminderEmail(quiz.email, subject, text);
}

async function sendDeadlineReminder(event, deadline) {
  const deadlineDate = new Date(deadline.datetime);
  const daysUntil = Math.ceil((deadlineDate - new Date()) / (1000 * 60 * 60 * 24));
  
  const subject = `Reminder: ${event.title} - ${deadline.type.charAt(0).toUpperCase() + deadline.type.slice(1)} deadline in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`;
  const text = `The ${deadline.type} deadline for "${event.title}" is approaching!\n\n` +
    `Deadline: ${deadlineDate.toLocaleString()}\n` +
    `Days remaining: ${daysUntil}\n` +
    (event.registrationLink ? `Registration: ${event.registrationLink}\n` : '') +
    (deadline.notes ? `Notes: ${deadline.notes}\n` : '');
  
  return await sendReminderEmail(event.email, subject, text);
}

// Cron job: run every hour to check for reminders
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day

    console.log('Running reminder check at', now.toISOString());

    // Check quizzes (1 hour before)
    const quizzes = await Quiz.find({
      reminderEnabled: true,
      completed: { $ne: true },
      datetime: { $gte: now, $lte: oneDayFromNow },
    });

    for (const quiz of quizzes) {
      const quizDate = new Date(quiz.datetime);
      const hoursUntil = (quizDate - now) / (1000 * 60 * 60);
      
      // Send reminder if within 1 hour
      if (hoursUntil <= 1 && hoursUntil > 0) {
        await sendQuizReminder(quiz);
      }
    }

    // Check hackathon deadlines (3 days before)
    const events = await HackathonEvent.find({
      email: { $exists: true, $ne: '' },
      deadlines: { $exists: true, $ne: [] },
    });

    for (const event of events) {
      for (const deadline of event.deadlines) {
        if (!deadline.reminderEnabled || deadline.completed) continue;
        
        const deadlineDate = new Date(deadline.datetime);
        if (deadlineDate < now) continue; // Skip past deadlines

        const daysUntil = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
        const lastReminderSent = deadline.lastReminderSent ? new Date(deadline.lastReminderSent) : null;
        const hoursSinceLastReminder = lastReminderSent ? (now - lastReminderSent) / (1000 * 60 * 60) : Infinity;

        // Send reminder if:
        // 1. Deadline is within 3 days
        // 2. Haven't sent a reminder in the last 12 hours (to avoid spam)
        // 3. Deadline is in the future
        if (daysUntil <= 3 && daysUntil >= 0 && hoursSinceLastReminder >= 12) {
          const sent = await sendDeadlineReminder(event, deadline);
          
          if (sent) {
            // Update the deadline to mark that reminder was sent
            await HackathonEvent.updateOne(
              { _id: event._id, 'deadlines.id': deadline.id },
              { $set: { 'deadlines.$.lastReminderSent': now } }
            );
            console.log(`Reminder sent for event ${event.title}, deadline ${deadline.type}, ${daysUntil} days remaining`);
          }
        }
      }
    }

    console.log('Reminder check completed');
  } catch (err) {
    console.error('Cron job error:', err.message);
    console.error(err.stack);
  }
});

app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});

