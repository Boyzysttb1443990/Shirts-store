// database.js
// เก็บข้อมูลลงไฟล์ JSON ธรรมดา (backend/shop-data.json) แทนการใช้ SQLite

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

function findUserByPhone(phone) {
  const data = loadData();
  return data.users.find((u) => u.phone === phone) || null;
}

function createUser({ fullname, phone, passwordHash }) {
  const data = loadData();
  const user = {
    id: data.nextUserId++,
    fullname,
    phone,
    password_hash: passwordHash,
    created_at: new Date().toISOString(),
  };
  data.users.push(user);
  saveData(data);
  return user;
}

function createOrder({ userId, items, total, address, payment }) {
  const data = loadData();
  const order = {
    id: data.nextOrderId++,
    user_id: userId,
    items,
    total,
    address,
    payment,
    status: "pending",
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

module.exports = {
  findUserByPhone,
  createUser,
  createOrder,
  getOrdersByUser,
};