// routes/orders.js
const express = require("express");
const { createOrder, getOrdersByUser, getAllOrdersWithCustomer, updateOrderStatus } = require("../database");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

const VALID_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

// สร้างคำสั่งซื้อใหม่ (ต้อง login ก่อน)
router.post("/", requireAuth, (req, res) => {
  const { items, total, address, payment } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "ตะกร้าสินค้าว่าง ไม่สามารถสั่งซื้อได้" });
  }
  if (!total || !address || !payment) {
    return res.status(400).json({ error: "ข้อมูลคำสั่งซื้อไม่ครบถ้วน" });
  }

  const order = createOrder({ userId: req.user.id, items, total, address, payment });
  res.status(201).json({ order: formatOrder(order) });
});

// ดึงประวัติคำสั่งซื้อทั้งหมดของผู้ใช้ที่ login อยู่ เรียงใหม่สุดก่อน
router.get("/", requireAuth, (req, res) => {
  const orders = getOrdersByUser(req.user.id);
  res.json({ orders: orders.map(formatOrder) });
});

// ---------- Admin only ----------

// ดูคำสั่งซื้อของลูกค้า "ทุกคน" พร้อมชื่อ/เบอร์ผู้สั่ง
router.get("/admin/all", requireAuth, requireAdmin, (req, res) => {
  const orders = getAllOrdersWithCustomer();
  res.json({ orders: orders.map((o) => ({ ...formatOrder(o), customer: o.customer })) });
});

// เปลี่ยนสถานะคำสั่งซื้อ เช่น pending -> confirmed -> shipped -> delivered
router.patch("/admin/:id/status", requireAuth, requireAdmin, (req, res) => {
  const orderId = Number(req.params.id);
  const { status } = req.body;

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: "สถานะไม่ถูกต้อง" });
  }

  const updated = updateOrderStatus(orderId, status);
  if (!updated) {
    return res.status(404).json({ error: "ไม่พบคำสั่งซื้อนี้" });
  }

  res.json({ order: formatOrder(updated) });
});

function formatOrder(order) {
  return {
    id: order.id,
    items: order.items,
    total: order.total,
    address: order.address,
    payment: order.payment,
    status: order.status,
    createdAt: order.created_at,
  };
}

module.exports = router;
