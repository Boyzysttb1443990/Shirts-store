// middleware/auth.js
const jwt = require("jsonwebtoken");
const { findUserById } = require("../database");

// ตรวจสอบ JWT token ที่ส่งมาใน header: Authorization: Bearer <token>
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "กรุณาเข้าสู่ระบบก่อนใช้งาน" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // เช็คว่าบัญชีที่ token นี้อ้างถึง ยังมีอยู่จริงในข้อมูลปัจจุบันไหม
    // จำเป็นเพราะ token เก่าที่ยังไม่หมดอายุ (เก็บอยู่ใน localStorage ฝั่งลูกค้า)
    // อาจอ้างถึง user_id ที่ไม่มีอยู่แล้ว หลังจากข้อมูลถูกล้าง/รีเซ็ต (เช่น ตอน deploy ใหม่)
    // ถ้าปล่อยผ่านไป จะสร้างออเดอร์ที่หาเจ้าของไม่เจอ (โชว์เป็น "Unknown" ในหน้า Admin)
    const user = findUserById(payload.id);
    if (!user) {
      return res.status(401).json({ error: "ไม่พบบัญชีนี้แล้ว กรุณาเข้าสู่ระบบใหม่อีกครั้ง" });
    }

    // ใช้ข้อมูลสดจากฐานข้อมูลเสมอ (ไม่ใช่ค่าเก่าที่ฝังไว้ตอน login) เผื่อมีการเปลี่ยน role/fullname ภายหลัง
    req.user = { id: user.id, phone: user.phone, fullname: user.fullname, role: user.role || "customer" };
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
