// database.js
// เก็บข้อมูลลงไฟล์ JSON ธรรมดา (backend/shop-data.json) แทนการใช้ SQLite
// เหตุผล: ไม่ต้องคอมไพล์อะไรเลย ใช้ได้ทันทีทุกเครื่อง เหมาะกับร้านค้าขนาดเล็ก-กลาง

const fs = require("fs");
const path = require("path");

const DB_FILE = path.join(__dirname, "shop-data.json");

function loadData() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = { users: [], orders: [], nextUserId: 1, nextOrderId: 1 };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

function saveData(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ---------- Users ----------
function findUserByPhone(phone) {
  const data = loadData();
  return data.users.find((u) => u.phone === phone) || null;
}

function findUserById(id) {
  const data = loadData();
  return data.users.find((u) => u.id === id) || null;
}

function createUser({ fullname, phone, passwordHash, role }) {
  const data = loadData();
  const user = {
    id: data.nextUserId++,
    fullname,
    phone,
    password_hash: passwordHash,
    role: role || "customer", // "customer" | "admin"
    created_at: new Date().toISOString(),
  };
  data.users.push(user);
  saveData(data);
  return user;
}

// ---------- Orders ----------
function createOrder({ userId, items, total, address, payment }) {
  const data = loadData();
  const order = {
    id: data.nextOrderId++,
    user_id: userId,
    items,
    total,
    address,
    payment,
    status: "pending", // pending -> confirmed -> shipped -> delivered (or cancelled)
    created_at: new Date().toISOString(),
  };
  data.orders.push(order);
  saveData(data);
  return order;
}

function getOrdersByUser(userId) {
  const data = loadData();
  return data.orders
    .filter((o) => o.user_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

// ---------- Admin ----------
// ดึงคำสั่งซื้อ "ทั้งหมด" ของทุกคน พร้อมแนบชื่อ/เบอร์ลูกค้าไปด้วย (สำหรับหน้า admin เท่านั้น)
function getAllOrdersWithCustomer() {
  const data = loadData();
  const userById = new Map(data.users.map((u) => [u.id, u]));

  return data.orders
    .slice()
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .map((order) => {
      const user = userById.get(order.user_id);
      return {
        ...order,
        customer: user ? { fullname: user.fullname, phone: user.phone } : null,
      };
    });
}

function updateOrderStatus(orderId, status) {
  const data = loadData();
  const order = data.orders.find((o) => o.id === orderId);
  if (!order) return null;
  order.status = status;
  saveData(data);
  return order;
}

module.exports = {
  findUserByPhone,
  findUserById,
  createUser,
  createOrder,
  getOrdersByUser,
  getAllOrdersWithCustomer,
  updateOrderStatus,
};
