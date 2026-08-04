// middleware/auth.js
// ตรวจสอบ JWT token ที่ส่งมาใน header: Authorization: Bearer <token>
// ถ้า token ถูกต้อง จะแนบ req.user = { id, phone, fullname } แล้วให้ผ่านต่อไป
// ถ้าไม่มี/ไม่ถูกต้อง จะตอบ 401 ทันที (ห้ามเข้าถึงข้อมูล)

const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "กรุณาเข้าสู่ระบบก่อนใช้งาน" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, phone, fullname }
    next();
  } catch (err) {
    return res.status(401).json({ error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" });
  }
}

module.exports = { requireAuth };
