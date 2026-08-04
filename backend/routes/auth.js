// routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { findUserByPhone, createUser } = require("../database");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function validateRegisterInput({ fullname, phone, password }) {
  if (!fullname || fullname.trim().length < 2) return "กรุณากรอกชื่อ-นามสกุลให้ถูกต้อง";
  if (!phone || phone.trim().length < 6) return "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง";
  if (!password || password.length < 6) return "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
  return null;
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, phone: user.phone, fullname: user.fullname },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
}

router.post("/register", async (req, res) => {
  const { fullname, phone, password } = req.body;

  const validationError = validateRegisterInput({ fullname, phone, password });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const cleanPhone = phone.trim();

  const existing = findUserByPhone(cleanPhone);
  if (existing) {
    return res.status(409).json({ error: "เบอร์โทรนี้ถูกใช้สมัครสมาชิกไปแล้ว" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = createUser({ fullname: fullname.trim(), phone: cleanPhone, passwordHash });
  const token = signToken(user);

  res.status(201).json({
    token,
    user: { id: user.id, fullname: user.fullname, phone: user.phone },
  });
});

router.post("/login", async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return res.status(400).json({ error: "กรุณากรอกเบอร์โทรและรหัสผ่าน" });
  }

  const user = findUserByPhone(phone.trim());
  if (!user) {
    return res.status(401).json({ error: "ไม่พบบัญชีผู้ใช้นี้ หรือรหัสผ่านไม่ถูกต้อง" });
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    return res.status(401).json({ error: "ไม่พบบัญชีผู้ใช้นี้ หรือรหัสผ่านไม่ถูกต้อง" });
  }

  const token = signToken(user);

  res.json({
    token,
    user: { id: user.id, fullname: user.fullname, phone: user.phone },
  });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;