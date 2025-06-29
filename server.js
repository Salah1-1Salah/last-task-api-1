const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const SECRET = process.env.JWT_SECRET || 'secret123';

const Team = require('./models/Team');
const Task = require('./models/Task');
const User = require('./models/User');

app.use(cors());
app.use(express.json());

// تسجيل مستخدم جديد
app.post('/api/register', async (req, res) => {
  const { name, email, password, role, teamId } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hash, role, teamId });
  await user.save();
  res.json(user);
});

// تسجيل الدخول
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'بيانات غير صحيحة' });
  }
  const token = jwt.sign({ userId: user._id, role: user.role }, SECRET);
  res.json({ token, user });
});

const auth = (roles = []) => {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) return res.sendStatus(401);
    const token = header.split(' ')[1];
    try {
      const decoded = jwt.verify(token, SECRET);
      if (roles.length && !roles.includes(decoded.role)) return res.sendStatus(403);
      req.user = decoded;
      next();
    } catch {
      res.sendStatus(401);
    }
  };
};

// API CRUD
app.post('/api/team', async (req, res) => {
  const team = new Team(req.body);
  await team.save();
  res.json(team);
});

app.get('/api/team/:id', async (req, res) => {
  const team = await Team.findById(req.params.id).populate('tasks');
  res.json({ ...team._doc, tasks: team.tasks });
});

app.post('/api/task', auth(['admin']), async (req, res) => {
  const { teamId, title, assignedTo, status } = req.body;
  const task = new Task({ title, assignedTo, status });
  await task.save();
  await Team.findByIdAndUpdate(teamId, { $push: { tasks: task._id } });
  res.json(task);
});

app.put('/api/task/:id', async (req, res) => {
  const { status } = req.body;
  const task = await Task.findByIdAndUpdate(req.params.id, { status }, { new: true });
  res.json(task);
});

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/team_tasks', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));