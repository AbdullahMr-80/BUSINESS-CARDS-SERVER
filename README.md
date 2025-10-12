# 📇 Business Cards Server

A complete **Node.js + MongoDB backend** for managing users and digital business cards.

Supports authentication, role-based access control, full CRUD operations, logging, and email notifications.

---

## ✨ Features

### 👤 Users Module

- Register, log in, and manage user profiles
- Roles: **Admin**, **Business**, and **Regular User**
- Admin tools:
  - Block / unblock users
  - List, search, and filter users
- Password reset and welcome emails
- Presence and status tracking
- 24-hour lockout after repeated login failures

### 💳 Cards Module

- Create, edit, delete, and list business cards
- Auto-generated **6-digit business number**
- Public viewing of all cards
- Authenticated users can **like/unlike** cards
- Admins have full control (can edit/delete any card)

### ⚙️ Common Services

- Environment variable validation
- SMTP + email templates (Welcome, Reset, Change Password)
- Request logging via **Morgan** (colorful in dev)
- File logging for errors (≥400) under `/logs`
- Dual database environments: **Local** and **Atlas**, configurable in `.env`

---

## 🗂️ Project Structure

```
src/
 ├─ cards/         # Cards module
 ├─ users/         # Users module
 ├─ common/        # Shared schemas & regex
 ├─ config/        # env.js, mongo.js
 ├─ db/            # Connection & seeding
 ├─ mails/         # Email templates
 ├─ middlewares/   # Auth, validation, logging
 ├─ utils/         # JWT, mailer, paginate
 └─ index.js       # Server entry point
```

---

## ⚙️ Environment Variables

```bash
PORT=5000
NODE_ENV=development
APP_BASE_URL=http://localhost:5000

# MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/business_cards_db
APP_DB=local
MONGO_URI_LOCAL=mongodb://127.0.0.1:27017/business_cards_db
MONGO_URI_ATLAS=mongodb+srv://<user>:<pass>@<cluster>/<db>

# JWT
JWT_SECRET=supersecretkey

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=yourpassword

# CORS
CORS_ORIGIN=http://localhost:3000
```

---

## 🚀 API Overview

### 👥 Users Endpoints

|  Method   | Endpoint                 | Description                                         | Access        |
| :-------: | :----------------------- | :-------------------------------------------------- | :------------ |
| **POST**  | `/users`                 | Register a new user                                 | Public        |
| **POST**  | `/users/login`           | Log in and receive JWT                              | Public        |
|  **GET**  | `/users`                 | List all users with pagination, filters, and search | Admin         |
|  **GET**  | `/users/:id`             | Get details of a single user                        | Self or Admin |
| **PATCH** | `/users/:id`             | Update user profile                                 | Self or Admin |
| **PATCH** | `/users/:id/block`       | Block or unblock a user                             | Admin         |
| **POST**  | `/users/forgot-password` | Send a reset link to user’s email                   | Public        |
| **POST**  | `/users/reset-password`  | Complete reset using token                          | Public        |

#### **POST** `/users`

**Access:** Public  
**Description:** Register a new user.

```json
{
  "name": { "first": "Avi", "last": "Levi" },
  "phone": "052-1234567",
  "email": "avi@example.com",
  "password": "Abcd1234!",
  "image": { "url": "https://picsum.photos/300", "alt": "Avatar" },
  "address": {
    "country": "Israel",
    "city": "Tel Aviv",
    "street": "Dizengoff",
    "houseNumber": 10,
    "zip": 12345
  },
  "isBusiness": true
}
```

Response: `201 Created` → Returns the new user object.

---

#### **POST** `/users/login`

**Access:** Public  
**Description:** Authenticate user and return a JWT token.

```json
{ "email": "avi@example.com", "password": "Abcd1234!" }
```

Response: `200 OK`

```json
{
  "token": "JWT_TOKEN_STRING",
  "user": { "_id": "...", "email": "avi@example.com", "isBusiness": true }
}
```

---

#### **GET** `/users`

**Access:** Admin  
**Description:** Retrieve paginated list of users.

```
?page=1&limit=10&isBusiness=true&sort=-createdAt
```

Response: List of users with summaries.

---

#### **PATCH** `/users/:id`

**Access:** Self or Admin  
**Description:** Update user profile.
Response: Updated user object.

---

#### **PATCH** `/users/:id/block`

**Access:** Admin  
**Description:** Block or unblock a specific user.

---

#### **POST** `/users/forgot-password`

**Access:** Public  
**Description:** Sends reset email (always succeeds for security).

```json
{ "email": "avi@example.com" }
```

---

#### **POST** `/users/reset-password`

**Access:** Public  
**Description:** Resets password using token.

```json
{ "token": "<RESET_TOKEN>", "newPassword": "NewPass123!" }
```

---

### 💳 Cards Endpoints

|   Method   | Endpoint                   | Description                          | Access            |
| :--------: | :------------------------- | :----------------------------------- | :---------------- |
|  **POST**  | `/cards`                   | Create a new business card           | Business or Admin |
|  **GET**   | `/cards`                   | List all cards                       | Public            |
|  **GET**   | `/cards/:id`               | Get a single card by ID              | Public            |
|  **GET**   | `/cards/by-biz/:bizNumber` | Get card by business number          | Public            |
|  **GET**   | `/cards/my-cards`          | Get all cards owned by current user  | Authenticated     |
| **PATCH**  | `/cards/:id`               | Update card details                  | Owner or Admin    |
| **DELETE** | `/cards/:id`               | Delete a card                        | Owner or Admin    |
| **PATCH**  | `/cards/:id/like`          | Like or unlike a card                | Authenticated     |
| **PATCH**  | `/cards/:id/biz-number`    | Assign a new 6-digit business number | Admin             |

#### **POST** `/cards`

**Access:** Business or Admin  
**Description:** Create a new business card.

```json
{
  "title": "חנות פרחים אביב",
  "subtitle": "פרחים וצמחים לבית ולמשרד",
  "description": "חנות פרחים מקומית עם משלוחים לכל הארץ.",
  "phone": "03-9876543",
  "email": "flowers@aviv.co.il",
  "web": "https://avivflowers.co.il",
  "image": { "url": "https://picsum.photos/300", "alt": "זר פרחים" },
  "address": {
    "country": "ישראל",
    "city": "תל אביב",
    "street": "בן יהודה",
    "houseNumber": 22,
    "zip": 64321
  }
}
```

Response: `201 Created` → Full card object with bizNumber & owner.

---

#### **GET** `/cards`

**Access:** Public  
**Description:** List all cards with optional filters.

```
?search=פרחים&sort=-createdAt&limit=12&page=1
```

Response: Array of public card objects.

---

#### **PATCH** `/cards/:id` Update Card (keep existing on missing/empty)

**Access:** Owner or Admin
**Description:** Updates only the fields you provide.

- Missing fields are left unchanged.
- Fields sent as empty strings ("") are ignored (treated as missing) — existing DB values are kept.
- Nested objects (e.g., image, address) are updated by field, not replaced.

---

#### **PATCH** `/cards/:id/like`

**Access:** Authenticated Users  
**Description:** Toggle like/unlike a card.
Response:

```json
{ "liked": true, "likesCount": 12 }
```

---

#### **PATCH** `/cards/:id/biz-number`

**Access:** Admin  
**Description:** Assign a new 6-digit unique business number.

---

#### **DELETE** `/cards/:id`

**Access:** Card Owner or Admin  
**Description:** Permanently delete a card.

---

## 🧠 Error Responses

| Status | Meaning               | Example                      |
| :----: | :-------------------- | :--------------------------- |
|  400   | Bad Request           | Invalid request body         |
|  401   | Unauthorized          | Token missing or invalid     |
|  403   | Forbidden             | Not enough permissions       |
|  404   | Not Found             | Resource does not exist      |
|  409   | Conflict              | Duplicate bizNumber or email |
|  500   | Internal Server Error | Unexpected failure           |

---

## 🔐 Authentication

All protected routes require the following header:

```
Authorization: Bearer <JWT_TOKEN>
```

Token payload example:

```json
{ "_id": "USER_ID", "isBusiness": true, "isAdmin": false }
```

---

## 🧪 Example Flow

1. **Register** a business user → `/users`
2. **Login** → receive JWT token
3. **Create a card** → `/cards`
4. **List cards** → `/cards`
5. **Like a card** → `/cards/:id/like`
6. **Admin** can:
   - Block users
   - Assign new bizNumbers
   - Delete any card

---

## 🧰 Run Locally

```bash
npm install
npm run dev
```

Server runs at: **http://localhost:5000**  
Health check: **GET /health**

---

## 🌱 Database Seeding

When run in development, if the collections are empty, the app automatically seeds:

- **3 demo users** (Admin, Business, Regular)
- **3 demo cards**

---

## 🌍 Deployment

1. Push the project to GitHub.
2. Deploy on Render / Railway / Vercel.
3. Set `.env` variables in hosting dashboard.
4. App ,manual-connects to the database (Local / Atlas).

---

## 🧾 License

MIT License © 2025 **Card Forge**
