# 🎓 Student Management System — Full CRUD

Node.js + Express + MongoDB + React | REST API + Postman Testing Guide

---

## 📁 Project Structure

```
crud-app/
├── config/
│   └── db.js                    ← MongoDB connection
├── controllers/
│   └── studentController.js     ← Business logic (CRUD + stats)
├── models/
│   └── Student.js               ← Mongoose schema
├── routes/
│   └── studentRoutes.js         ← API routes + validation
├── frontend/                    ← React UI (bonus)
│   ├── src/
│   │   ├── App.jsx              ← Full CRUD interface
│   │   ├── index.css            ← Styles
│   │   ├── main.jsx             ← Entry point
│   │   └── utils/api.js         ← Axios instance
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── screenshots/                 ← Put your screenshots here
├── .env.example
├── .gitignore
├── package.json
└── server.js                    ← Express app entry
```

---

## ⚙️ Step 1: Install & Setup

### Prerequisites
- Node.js v18+ (download: nodejs.org)
- MongoDB running locally OR MongoDB Atlas account

### Install backend
```bash
cd crud-app
npm install
```

### Create .env file
```bash
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/student_management
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

> **Atlas users:** replace MONGO_URI with your Atlas connection string.

---

## ▶️ Step 2: Run the Backend

```bash
# Development (auto-restart on file save)
npm run dev

# Production
npm start
```

Expected output:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Server running on http://localhost:5000
📡 Environment: development
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ MongoDB Connected: localhost
📦 Database: student_management
```

---

## ▶️ Step 3: Run the Frontend (Bonus)

```bash
cd frontend
npm install
npm run dev
# Open: http://localhost:5173
```

---

## 🌐 API Endpoints

Base URL: `http://localhost:5000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/students` | Create a student |
| GET | `/api/students` | Get all students |
| GET | `/api/students/stats` | Platform statistics |
| GET | `/api/students/:id` | Get student by ID |
| PUT | `/api/students/:id` | Update student |
| DELETE | `/api/students/:id` | Delete student |

### Query Parameters (for GET /api/students)
| Param | Example | Description |
|-------|---------|-------------|
| search | `?search=john` | Search name/email/course |
| page | `?page=2` | Page number |
| limit | `?limit=5` | Results per page |
| sort | `?sort=name` | Sort field |
| order | `?order=asc` | Sort direction |
| course | `?course=BCA` | Filter by course |
| minAge | `?minAge=18` | Min age filter |
| maxAge | `?maxAge=25` | Max age filter |

---

## 🧪 Postman Testing Guide

### Setup
1. Open Postman
2. Create a new Collection: **"Student Management API"**
3. Set Base URL variable: `http://localhost:5000`

---

### API 1: Create Student (POST)

```
Method: POST
URL:    http://localhost:5000/api/students
Header: Content-Type: application/json
Body (raw JSON):
```
```json
{
  "name": "Arjun Sharma",
  "email": "arjun@student.com",
  "course": "B.Tech CSE",
  "age": 20,
  "phone": "9876543210"
}
```
**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Student created successfully!",
  "data": {
    "_id": "65abc123...",
    "name": "Arjun Sharma",
    "email": "arjun@student.com",
    "course": "B.Tech CSE",
    "age": 20,
    "phone": "9876543210",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```
📸 **Screenshot this response for your submission.**

---

### API 2: Get All Students (GET)

```
Method: GET
URL:    http://localhost:5000/api/students
Body:   None
```
**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Students fetched successfully!",
  "data": [ ... ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

**With search:**
```
GET http://localhost:5000/api/students?search=arjun
```

**With pagination:**
```
GET http://localhost:5000/api/students?page=1&limit=3
```

📸 **Screenshot this for your submission.**

---

### API 3: Get Student by ID (GET)

```
Method: GET
URL:    http://localhost:5000/api/students/{PASTE_ID_HERE}
```
Copy the `_id` from the create response and paste it.

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Student fetched successfully!",
  "data": { ... }
}
```

**If ID doesn't exist (404):**
```json
{
  "success": false,
  "message": "Student with ID 65abc123... not found."
}
```

---

### API 4: Update Student (PUT)

```
Method: PUT
URL:    http://localhost:5000/api/students/{STUDENT_ID}
Header: Content-Type: application/json
Body:
```
```json
{
  "name": "Arjun Kumar Sharma",
  "course": "M.Tech CSE",
  "age": 22
}
```
> You can update one or more fields. You don't need to send all fields.

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Student updated successfully!",
  "data": {
    "_id": "65abc123...",
    "name": "Arjun Kumar Sharma",
    "course": "M.Tech CSE",
    "age": 22,
    ...
  }
}
```
📸 **Screenshot this for your submission.**

---

### API 5: Delete Student (DELETE)

```
Method: DELETE
URL:    http://localhost:5000/api/students/{STUDENT_ID}
Body:   None
```
**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Student \"Arjun Kumar Sharma\" deleted successfully!",
  "data": { ... }
}
```
📸 **Screenshot this for your submission.**

---

### API 6: Get Statistics (GET)

```
Method: GET
URL:    http://localhost:5000/api/students/stats
```
**Expected Response:**
```json
{
  "success": true,
  "data": {
    "totalStudents": 5,
    "activeStudents": 4,
    "inactiveStudents": 1,
    "courseBreakdown": [
      { "_id": "B.Tech CSE", "count": 3 },
      { "_id": "BCA", "count": 2 }
    ],
    "ageStats": {
      "avgAge": 20.4,
      "minAge": 18,
      "maxAge": 24
    }
  }
}
```

---

### Validation Error Test (400 Bad Request)

Send a POST with missing fields:
```json
{ "name": "Test" }
```
**Expected Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Email is required" },
    { "field": "course", "message": "Course is required" },
    { "field": "age", "message": "Age is required" }
  ]
}
```

---

## 📸 Screenshots Checklist

Save all screenshots in `/screenshots/` folder:

| File Name | What to Capture |
|-----------|----------------|
| `01-server-running.png` | Terminal showing server started + MongoDB connected |
| `02-mongodb-compass.png` | MongoDB Compass showing `student_management` DB |
| `03-post-create.png` | Postman: POST create student — 201 response |
| `04-get-all.png` | Postman: GET all students — data array |
| `05-get-search.png` | Postman: GET with ?search= query |
| `06-get-pagination.png` | Postman: GET with ?page=1&limit=3 |
| `07-put-update.png` | Postman: PUT update — updated fields visible |
| `08-delete.png` | Postman: DELETE — success message |
| `09-validation-error.png` | Postman: 400 error for invalid data |
| `10-mongodb-data.png` | MongoDB Compass: students collection with records |
| `11-react-ui.png` | React frontend showing the table (bonus) |
| `12-folder-structure.png` | VS Code sidebar showing project files |

---

## 🗃️ MongoDB Schema

```javascript
{
  name:      String   // required, 2–100 chars
  email:     String   // required, unique, valid email format
  course:    String   // required
  age:       Number   // required, 10–100
  phone:     String   // optional
  isActive:  Boolean  // default: true
  createdAt: Date     // auto (timestamps: true)
  updatedAt: Date     // auto (timestamps: true)
}
```

---

## ⚠️ Common Errors & Fixes

### Error: `ECONNREFUSED 127.0.0.1:27017`
**Cause:** Local MongoDB is not running.
**Fix:**
```bash
# Windows: Start MongoDB service
net start MongoDB

# Mac:
brew services start mongodb-community

# Linux:
sudo systemctl start mongod
```
Or use MongoDB Atlas cloud connection string instead.

---

### Error: `MongoServerError: E11000 duplicate key`
**Cause:** Trying to create a student with an email that already exists.
**Fix:** Use a different email address. Each student must have a unique email.

---

### Error: `CastError: Cast to ObjectId failed`
**Cause:** You used an invalid ID format in the URL (e.g., just typed "123" instead of a real MongoDB ObjectId).
**Fix:** Copy the exact `_id` from the GET response (it's 24 characters like `65abc123def456...`).

---

### Error: `Cannot GET /api/student` (404)
**Cause:** Wrong URL — check spelling.
**Fix:** The correct URL is `/api/students` (plural, with an **s**).

---

### Error: `ValidationError: email: Please enter a valid email`
**Cause:** Email format is wrong.
**Fix:** Use format `name@domain.com`

---

### Error: `nodemon: command not found`
**Fix:**
```bash
npm install -g nodemon
# or just use:
node server.js
```

---

### Error: `SyntaxError: Unexpected token` in Postman
**Cause:** Your JSON body has a syntax error (missing comma, extra brace, etc.)
**Fix:** Use Postman's built-in JSON formatter (Format button in Body tab).

---

## 🚀 Quick Test Sequence

Run these in order in Postman:

```
1. GET  http://localhost:5000/                          ← health check
2. POST http://localhost:5000/api/students              ← create 3-4 students
3. GET  http://localhost:5000/api/students              ← see all
4. GET  http://localhost:5000/api/students?search=name  ← search
5. GET  http://localhost:5000/api/students/stats        ← statistics
6. PUT  http://localhost:5000/api/students/:id          ← update one
7. DELETE http://localhost:5000/api/students/:id        ← delete one
8. GET  http://localhost:5000/api/students              ← confirm deletion
```

---

## 🌟 Features Implemented

| Feature | Status |
|---------|--------|
| Create Student (POST) | ✅ |
| Get All Students (GET) | ✅ |
| Get by ID (GET /:id) | ✅ |
| Update Student (PUT) | ✅ |
| Delete Student (DELETE) | ✅ |
| Search by name/email/course | ✅ |
| Pagination (page + limit) | ✅ |
| Sort & Order | ✅ |
| Age range filter | ✅ |
| Input validation | ✅ |
| Duplicate email check | ✅ |
| Statistics API | ✅ |
| Proper HTTP status codes | ✅ |
| Global error handler | ✅ |
| dotenv configuration | ✅ |
| React frontend (bonus) | ✅ |
| MVC architecture | ✅ |
