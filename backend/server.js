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

async function sendReminderEmail(quiz) {
  if (!transporter) {
    console.warn('Email transport not configured; skipping email.');
    return;
  }
  if (!quiz.email) return;

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: quiz.email,
    subject: `Reminder: ${quiz.quizName} quiz coming up`,
    text: `Your quiz "${quiz.quizName}" on topic "${quiz.topic}" is scheduled at ${quiz.datetime}.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Reminder email sent for quiz', quiz._id);
  } catch (err) {
    console.error('Error sending reminder email:', err.message);
  }
}

// Cron job: run every 15 minutes
cron.schedule('*/15 * * * *', async () => {
  try {
    const now = new Date();
    const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);

    const quizzes = await Quiz.find({
      reminderEnabled: true,
      completed: { $ne: true },
      datetime: { $gte: now, $lte: inOneHour },
    });

    for (const quiz of quizzes) {
      await sendReminderEmail(quiz);
    }
  } catch (err) {
    console.error('Cron job error:', err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});

