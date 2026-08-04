// routes/orders.js
const express = require("express");
const { createOrder, getOrdersByUser } = require("../database");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

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

router.get("/", requireAuth, (req, res) => {
  const orders = getOrdersByUser(req.user.id);
  res.json({ orders: orders.map(formatOrder) });
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