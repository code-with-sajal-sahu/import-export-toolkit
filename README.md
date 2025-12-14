# 📦 Bulk Import/Export Toolkit

A powerful and reusable **MERN Stack** toolkit designed to streamline bulk data operations. This project provides a robust solution for **Bulk Importing** (via Excel/CSV), **Exporting** data, and handling **Validation Errors** gracefully. 

It is built to be easily integrated into existing applications to accelerate development.

---

## 🚀 Features

- **Bulk Import**: Drag & drop Excel files (`.xlsx`) to import large datasets.
- **Data Validation**: 
  - Validates required fields (Name, Email, Age, Location).
  - Checks for duplicate emails in the database.
  - Generates a downloadable **Error Report** Excel file for failed rows.
- **Bulk Export**: Download all user data in a formatted Excel file.
- **Rate Limiting**: API endpoints are protected against abuse.
- **Modern UI**: Clean, responsive interface built with React & TypeScript.
- **Sample File**: Downloadable sample template to guide users.

---

## 🛠️ Tech Stack

### **Frontend**
- **React 19** (Vite)
- **TypeScript**
- **Axios** (API Requests)
- **File Saver** (File Downloads)

### **Backend**
- **Node.js & Express**
- **MongoDB & Mongoose**
- **Multer** (File Uploads)
- **XLSX / SheetJS** (Excel Processing)
- **Joi** (Data Validation)

---

## 📂 Project Structure

```bash
bulk-import-export/
├── backend/            # Express Server
│   ├── src/
|   |   ├── config/       # Database configuration
│   │   ├── controllers/  # Logic for import/export
│   │   ├── middleware/   # File upload and api rate limiting
│   │   ├── models/       # Mongoose Schemas
│   │   ├── routes/       # API Routes
│   │   └── utils/        # Helper functions (Error Excel Generation)
│   └── server.js        # Entry point
│
└── frontend/           # React Client
    ├── src/
    │   ├── components/  # Reusable UI Components
    │   └── App.tsx      # Main Application
```

---

## ⚡ Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### 2. Backend Setup
Navigate to the backend folder and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` root:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

Start the server:
```bash
npm run dev
```

### 3. Frontend Setup
Navigate to the frontend folder and install dependencies:

```bash
cd frontend
npm install
```

Start the React development server:
```bash
npm run dev
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/users` | Fetch all users |
| **POST** | `/api/users/import` | Upload Excel file for bulk import |
| **GET** | `/api/users/export` | Download all users as Excel |
| **GET** | `/api/users/sample` | Download sample Excel template |

---

## 📝 Import Format Rules (Excel)

The imported Excel file **MUST** follow this column structure:

| Header | Required | Type | Notes |
| :--- | :--- | :--- | :--- |
| **Name** | Yes | String | Full name of the user |
| **Email** | Yes | String | Must be unique and a valid email |
| **Age** | Yes | Number | - |
| **Location** | Yes | String | City or Region |

