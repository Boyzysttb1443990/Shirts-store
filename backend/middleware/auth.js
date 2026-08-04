// middleware/auth.js
const jwt = require("jsonwebtoken");

// ตรวจสอบ JWT token ที่ส่งมาใน header: Authorization: Bearer <token>
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "กรุณาเข้าสู่ระบบก่อนใช้งาน" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, phone, fullname, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" });
  }
}

// ใช้ต่อจาก requireAuth เสมอ — ต้องผ่าน requireAuth ก่อนถึงจะมี req.user
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "หน้านี้สำหรับผู้ดูแลระบบเท่านั้น" });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
