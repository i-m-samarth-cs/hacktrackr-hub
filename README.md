# HackTrackr Hub

HackTrackr Hub is a dashboard to track hackathons, quizzes, deadlines, and reminders in one place.

## Getting Started (local development)

Make sure you have Node.js and npm installed.

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Step 3: Install frontend dependencies
npm install

# Step 4: Start the frontend dev server
npm run dev
```

If you are using the backend (MongoDB + email reminders), also run:

```sh
cd backend
npm install
npm run dev
```

## Tech Stack

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

Backend:

- Node.js + Express
- MongoDB (via Mongoose)
- Nodemailer + node-cron for email reminders

## Deployment

You can deploy the frontend to any static hosting provider (e.g. Vercel, Netlify) and the backend to a Node host (e.g. Render, Railway).

Make sure to configure the environment variables for:

- `MONGODB_URI`
- `MONGODB_DB`
- `PORT`
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_USER`
- `EMAIL_PASS`
- `EMAIL_FROM`

