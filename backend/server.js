require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/orders");

if (!process.env.JWT_SECRET) {
  console.error(
    "❌ ไม่พบ JWT_SECRET ใน .env — กรุณาคัดลอก .env.example เป็น .env แล้วตั้งค่า JWT_SECRET ก่อนรันเซิร์ฟเวอร์"
  );
  process.exit(1);
}

const app = express();

const allowedOrigin = process.env.ALLOWED_ORIGIN;
app.use(cors(allowedOrigin ? { origin: allowedOrigin } : {}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Boyzy Shop API กำลังทำงานที่ http://localhost:${PORT}`);
});
