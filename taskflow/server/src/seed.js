/**
 * Optional demo data:  npm run seed   (from the project root or the server folder)
 * Creates a demo user and a set of sample tasks so the dashboard is not empty.
 * Demo-only credentials - delete this file before real deployment if you prefer.
 */
const config = require('./config/env');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Task = require('./models/Task');

const DEMO = { name: 'Demo User', email: 'demo@taskflow.dev', password: 'Demo@1234' };

const day = (offset) => {
  const d = new Date();
  const local = new Date(d.getFullYear(), d.getMonth(), d.getDate() + offset);
  const pad = (n) => String(n).padStart(2, '0');
  return new Date(`${local.getFullYear()}-${pad(local.getMonth() + 1)}-${pad(local.getDate())}T00:00:00.000Z`);
};

const samples = [
  { title: 'Finish MERN project README', description: 'Add setup steps, screenshots and the API table.', priority: 'High', dueDate: day(1), status: 'Pending' },
  { title: 'Fix login form validation messages', description: 'Show inline errors under each field.', priority: 'High', dueDate: day(-2), status: 'Pending' },
  { title: 'Review pull request from teammate', description: '', priority: 'Medium', dueDate: day(0), status: 'Pending' },
  { title: 'Test API endpoints in Thunder Client', description: 'Cover valid input, invalid input and missing token.', priority: 'Medium', dueDate: day(3), status: 'Pending' },
  { title: 'Deploy backend to Render', description: 'Set production environment variables and CORS origin.', priority: 'High', dueDate: day(6), status: 'Pending' },
  { title: 'Set up MongoDB Atlas cluster', description: 'Create a database user with minimum permissions.', priority: 'Medium', dueDate: day(-5), status: 'Done' },
  { title: 'Design wireframes for mobile view', description: 'Dashboard, task form and login screens.', priority: 'Low', dueDate: day(-7), status: 'Done' },
  { title: 'Create GitHub repository', description: 'Add .gitignore before the first commit.', priority: 'Low', dueDate: day(-9), status: 'Done' },
  { title: 'Read Express security best practices', description: '', priority: 'Low', dueDate: null, status: 'Pending' },
  { title: 'Record a short demo video', description: 'Walk through register, add task, filters and progress bar.', priority: 'Medium', dueDate: day(10), status: 'Pending' },
];

(async () => {
  await connectDB();
  const old = await User.findOne({ email: DEMO.email });
  if (old) {
    await Task.deleteMany({ user: old._id });
    await old.deleteOne();
  }

  const user = await User.create(DEMO);
  for (const s of samples) await Task.create({ ...s, user: user._id });

  console.log(`[seed] Created demo user and ${samples.length} tasks.`);
  console.log(`[seed] Login with  ${DEMO.email}  /  ${DEMO.password}`);
  await mongoose.disconnect();
})().catch((err) => {
  console.error('[seed] Failed:', err.message);
  process.exit(1);
});
