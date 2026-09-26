const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(express.json());
app.use(cors());

// Serve static frontend files from the current folder
app.use(express.static(__dirname));

// In-memory mock database for hackathon speed
let users = [];
let otpStore = {}; // stores email -> otp code

// 1. SIGNUP ROUTE
app.post('/api/auth/signup', (req, res) => {
  const { full_name, email, password, role } = req.body;
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'Email already registered!' });
  }
  const newUser = { full_name, email, password, role };
  users.push(newUser);
  res.json({ success: true, message: 'User registered successfully' });
});

// 2. LOGIN ROUTE
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(400).json({ error: 'Invalid email or password!' });
  }
  res.json({
    success: true,
    token: 'mock-jwt-token-12345',
    user: { full_name: user.full_name, email: user.email, role: user.role }
  });
});

// 3. REQUEST OTP ROUTE
app.post('/api/auth/request-otp', (req, res) => {
  const { email } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(400).json({ error: 'Email not found in system!' });
  }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[email] = otp;
  
  res.json({ success: true, otpPreview: otp });
});

// 4. RESET PASSWORD ROUTE
app.post('/api/auth/reset-password', (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!otpStore[email] || otpStore[email] !== otp) {
    return res.status(400).json({ error: 'Invalid or expired OTP code!' });
  }
  const user = users.find(u => u.email === email);
  if (user) {
    user.password = newPassword;
    delete otpStore[email];
    return res.json({ success: true, message: 'Password updated successfully' });
  }
  res.status(400).json({ error: 'User not found' });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 StockSense running at http://localhost:${PORT}`);
});