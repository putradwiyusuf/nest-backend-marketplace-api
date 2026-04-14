# 🛒 Marketplace API (NestJS)

Backend API marketplace seperti OLX menggunakan NestJS + Prisma + PostgreSQL.

---

# 🚀 Tech Stack

- NestJS (Backend Framework)
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Multer (File Upload)
- TypeScript
- Class Validator

---

# 📦 Features

## 🔐 Authentication

- Register / Login
- JWT Token Auth
- Role-based access (RBAC ready)

## 📦 Listings

- Create / Read / Update / Delete listing
- Soft delete & force delete (admin)
- Pagination
- Search & filter (price, category)
- View count tracking

## 🖼️ Image System

- Multiple image upload per listing
- Primary image support
- Local storage (/uploads)

## 👤 Ownership System

- User hanya bisa edit/delete listing miliknya
- Protected route via guard

---

# ⚙️ Installation

## 1. Clone project

git clone https://github.com/your-username/nest-backend-marketplace-api.git
cd nest-backend-marketplace-api

---

## 2. Install dependencies

npm install

---

## 3. Setup environment

Buat file .env

DATABASE_URL="postgresql://user:password@localhost:5432/marketplace"
JWT_SECRET="your-secret-key"
PORT=3000

---

## 4. Setup database (Prisma)

npx prisma generate
npx prisma migrate dev

(Optional seed)
npx prisma db seed

---

## 5. Create uploads folder

mkdir uploads

---

# ▶️ Running Project

## Development

npm run start:dev

## Production

npm run build
npm run start:prod

---

# 📌 API Base URL

http://localhost:3000

---

# 📦 API Endpoints

## Auth

POST /auth/register
POST /auth/login

---

## Listings

GET /listings
GET /listings/:id
POST /listings
PATCH /listings/:id
DELETE /listings/:id

---

## My Listings

GET /listings/me

---

## Images

POST /listings/:id/images
DELETE /images/:id

---

# 🔐 Authorization

Authorization: Bearer <token>

---

# 📸 Upload Image (Postman)

POST /listings/:id/images

Body:
form-data
key: images (file)
allow multiple files

---

# 🧠 Architecture Flow

Controller → Service → Prisma → Database
↓
Mapper
↓
Response Interceptor
↓
Final JSON Response

---

# 📊 Response Format

## Success

{
"success": true,
"data": {},
"meta": null
}

---

## Error

{
"success": false,
"statusCode": 404,
"message": "Not Found",
"errors": null,
"timestamp": "2026-04-14T00:00:00.000Z",
"path": "/listings/1"
}

---

# 🧱 Database Notes

- Soft delete: deletedAt
- Listing → Images (1:N)
- Listing → Category
- Listing → Location
- Listing → User

---

# 🧪 Dev Notes

- Upload disimpan di /uploads
- Image pertama = primary image
- View count auto increment
- Mapper digunakan untuk clean response
- DTO digunakan untuk validation

---

# 🚀 Future Improvements

- Cloud storage (S3 / Cloudinary)
- Redis caching
- Full RBAC permission system
- WebSocket chat system
- Admin dashboard API
- Search engine (Elasticsearch)

---

# 👨‍💻 Author

Built with NestJS for scalable marketplace backend system.

---

# ⚠️ Disclaimer

Project ini masih dalam tahap development aktif dan akan terus berkembang.
