const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../config/db');

// 1. User Signup
exports.signup = async (req, res) => {
  const { full_name, email, password, role } = req.body;
  const db = getDB();

  try {
    const existing = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const userRole = role === 'Warehouse Staff' ? 'Warehouse Staff' : 'Inventory Manager';

    const result = await db.run(
      'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [full_name, email, password_hash, userRole]
    );

    res.status(201).json({ message: 'User registered successfully!', userId: result.lastID });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. User Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const db = getDB();

  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.full_name },
      process.env.JWT_SECRET || 'stocksense_super_secret_key_123',
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful!',
      token,
      user: { id: user.id, name: user.full_name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. Request OTP for Password Reset
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const db = getDB();

  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(404).json({ error: 'User with this email not found.' });
    }

    // 6 digit OTP generate panrom
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes expiry

    await db.run(
      'INSERT INTO otp_codes (user_id, otp_code, expires_at) VALUES (?, ?, ?)',
      [user.id, otp, expiresAt]
    );

    // In a live app, email send pannuvom. For dev, terminal & JSON-la print panrom:
    console.log(`🔑 Password Reset OTP for ${email}: ${otp}`);

    res.json({ message: 'OTP sent successfully! (Check server console in development)', otpPreview: otp });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. Reset Password with OTP
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const db = getDB();

  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const validOTP = await db.get(
      'SELECT * FROM otp_codes WHERE user_id = ? AND otp_code = ? AND is_used = 0 AND expires_at > datetime("now") ORDER BY id DESC LIMIT 1',
      [user.id, otp]
    );

    if (!validOTP) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await db.run('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, user.id]);
    await db.run('UPDATE otp_codes SET is_used = 1 WHERE id = ?', [validOTP.id]);

    res.json({ message: 'Password reset successfully! You can now login.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};