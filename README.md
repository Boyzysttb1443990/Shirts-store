# Boyzy Shop — Login + ประวัติคำสั่งซื้อ + หน้า Admin

```
frontend/   → Workshop.html (หน้าร้าน), admin.html (หน้าแอดมิน), Workshop.css, admin.css
backend/    → Node.js + Express (เก็บบัญชีผู้ใช้และคำสั่งซื้อจริงลงไฟล์ shop-data.json)
```

---

## 1. รันบนเครื่องตัวเอง (ทดสอบ)

```bash
cd backend
npm install
cp .env.example .env
```
เปิด `.env` แล้วแก้ 2 ค่า:
- `JWT_SECRET` → ข้อความสุ่มยาวๆ ของพี่เอง
- `ADMIN_PHONES` → ใส่เบอร์โทรที่ต้องการให้เป็นแอดมิน เช่น `ADMIN_PHONES=02012345`
  (เบอร์นี้ตอน "Register" ครั้งแรกจะได้สิทธิ์ admin อัตโนมัติ)

```bash
node server.js
```

เปิด `frontend/Workshop.html` → หน้าร้านปกติสำหรับลูกค้า
เปิด `frontend/admin.html` → หน้าแอดมิน (login ด้วยเบอร์ที่อยู่ใน `ADMIN_PHONES`)

---

## 2. หน้า Admin ใช้ยังไง

1. เปิด `admin.html`
2. Sign in ด้วยเบอร์โทร/รหัสผ่านของบัญชีที่มีสิทธิ์ admin
   (ถ้ายังไม่เคยสมัคร ให้ไปสมัครที่หน้าร้านปกติ `Workshop.html` ด้วยเบอร์ที่อยู่ใน `ADMIN_PHONES` ก่อน)
3. จะเห็น dashboard: จำนวนออเดอร์ทั้งหมด, ยอดขายรวม, จำนวนที่ยัง pending
4. ตารางด้านล่างโชว์ทุกออเดอร์ของทุกลูกค้า พร้อมชื่อ/เบอร์ผู้สั่ง
5. เปลี่ยนสถานะออเดอร์ได้จาก dropdown ในแต่ละแถว (pending → confirmed → shipped → delivered)
6. กรองดูเฉพาะสถานะที่ต้องการได้จากช่อง "All statuses" มุมขวาบนตาราง

**เพิ่มแอดมินคนที่ 2:** แก้ `.env` เพิ่มเบอร์ในรายการ `ADMIN_PHONES` (คั่นด้วยจุลภาค เช่น `02012345,02099999`) แล้ว restart server ด้วย `node server.js` ใหม่ ก่อนให้คนนั้นสมัครสมาชิก

---

## 3. Deploy ขึ้นเว็บจริง

โปรเจกต์นี้มี 2 ส่วนที่ต้อง deploy แยกกัน: **backend** (ต้องมีที่รัน Node.js ตลอดเวลา) และ **frontend** (ไฟล์ static ธรรมดา วางไว้ที่ไหนก็ได้ เช่น GitHub Pages ที่มีอยู่แล้ว)

### 3.1 Deploy backend ด้วย Render (แนะนำ ฟรีเริ่มต้นได้)

1. ไปที่ https://render.com → สมัคร/login ด้วยบัญชี GitHub
2. กด **New +** → **Web Service**
3. เลือก repo `Shirts-store` ของพี่ (ต้อง push ขึ้น GitHub ให้ล่าสุดก่อน)
4. ตั้งค่า:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. เพิ่ม Environment Variables (แท็บ Environment):
   - `JWT_SECRET` = ข้อความสุ่มยาวๆ (ห้ามใช้ค่าเดียวกับตอนทดสอบในเครื่อง)
   - `ADMIN_PHONES` = เบอร์ที่ต้องการให้เป็นแอดมิน
   - `ALLOWED_ORIGIN` = URL ของหน้าเว็บจริง (เช่น `https://boyzysttb1443990.github.io`) — ใส่หลังจากรู้ URL ของ frontend แล้ว
6. กด **Create Web Service** รอ deploy เสร็จ จะได้ URL ประมาณ `https://shirts-store-api.onrender.com`

**⚠️ ข้อควรรู้เรื่องการเก็บข้อมูลบน Render free tier:**
ตอนนี้ backend เก็บข้อมูลลงไฟล์ `shop-data.json` บน disk ของ server เอง — แต่ Render free tier
เป็น "ephemeral disk" คือไฟล์จะ**หายทุกครั้งที่ deploy ใหม่หรือ server restart** เหมาะกับทดสอบ/เดโม
ไม่เหมาะเก็บข้อมูลลูกค้าจริงระยะยาว

ทางแก้ (เลือกอย่างใดอย่างหนึ่งเมื่อพร้อมใช้งานจริงจัง):
- อัปเกรด Render เป็นแผนที่มี **Persistent Disk** (มีค่าใช้จ่ายรายเดือน)
- หรือย้ายไปใช้ฐานข้อมูลบนคลาวด์ฟรี เช่น **Supabase** หรือ **Neon** (PostgreSQL ฟรี) — บอกผมได้ถ้าพี่พร้อมจะย้าย ผมช่วยแปลงโค้ดให้ได้

### 3.2 Deploy frontend

frontend อยู่บน GitHub Pages อยู่แล้ว (repo `Shirts-store`) แค่ต้องอัปเดต `API_BASE`:

1. เปิดไฟล์ `frontend/Workshop.html` และ `frontend/admin.html`
2. หาบรรทัด:
   ```js
   const API_BASE = "http://localhost:4000/api";
   ```
3. เปลี่ยนเป็น URL ของ backend ที่ deploy ไว้ใน Render:
   ```js
   const API_BASE = "https://shirts-store-api.onrender.com/api";
   ```
4. Commit + Push ขึ้น GitHub (ผ่าน VS Code Source Control เหมือนที่เคยทำ)
5. รอ GitHub Pages build เสร็จ (ดูสถานะได้ที่แท็บ **Actions** ใน repo) แล้วเข้าเว็บผ่านลิงก์ GitHub Pages ได้เลย — คราวนี้ login/order จะทำงานได้จริงเพราะ backend อยู่บนอินเทอร์เน็ตแล้ว

### 3.3 เช็คก่อนใช้งานจริง

- [ ] `JWT_SECRET` บน Render ไม่ใช่ค่าเดียวกับตอนทดสอบในเครื่อง
- [ ] `ALLOWED_ORIGIN` ตั้งเป็น URL ของ GitHub Pages พี่แล้ว (กันเว็บอื่นมาเรียก API สวมรอย)
- [ ] `API_BASE` ในทั้ง `Workshop.html` และ `admin.html` ชี้ไป Render URL แล้ว ไม่ใช่ localhost
- [ ] ทดลอง Register/Login/สั่งซื้อ/ดูประวัติ ผ่านลิงก์ GitHub Pages จริง (ไม่ใช่เปิดไฟล์ในเครื่อง)

---

## 4. โครงสร้าง API

| Method | Endpoint                         | สิทธิ์         | คำอธิบาย                          |
|--------|-----------------------------------|:--------------:|------------------------------------|
| POST   | /api/auth/register                 | ทุกคน          | สมัครสมาชิก → คืน token           |
| POST   | /api/auth/login                    | ทุกคน          | เข้าสู่ระบบ → คืน token           |
| GET    | /api/auth/me                       | ต้อง login      | ดึงข้อมูลผู้ใช้จาก token ปัจจุบัน |
| POST   | /api/orders                        | ต้อง login      | สร้างคำสั่งซื้อใหม่                |
| GET    | /api/orders                        | ต้อง login      | ดูประวัติคำสั่งซื้อของตัวเอง       |
| GET    | /api/orders/admin/all              | ต้องเป็น admin | ดูคำสั่งซื้อทุกคนพร้อมชื่อลูกค้า   |
| PATCH  | /api/orders/admin/:id/status       | ต้องเป็น admin | เปลี่ยนสถานะคำสั่งซื้อ              |

ยืนยันตัวตนด้วย JWT — แนบไปกับ request ที่ต้อง login ผ่าน header `Authorization: Bearer <token>`
สิทธิ์ผู้ใช้ (`role`) ถูกฝังไว้ใน token ตอน login/register แล้ว ("customer" หรือ "admin")
