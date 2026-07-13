# 🛡️ Anti Bully Protocol

A modern **MERN Stack** web application designed to create a safer educational environment by providing a secure platform for reporting, managing, and resolving bullying incidents. The system enables students to submit reports while allowing designated captains to review, manage, and coordinate appropriate actions.

---

## 🚀 Live Demo

**Website:** *Add your deployed URL here*

```text
https://your-live-site-url.com
```

---

## 📖 Project Overview

Anti Bully Protocol is built to promote a safe and supportive campus environment. Students can submit bullying reports, while authorized captains monitor incidents, track progress, and ensure timely intervention.

The application focuses on:

* Secure incident reporting
* Student-friendly interface
* Captain dashboard for management
* Role-based access control
* Modern responsive UI
* Fast and scalable architecture

---

# 📌 How to Use

### 1. Read `DEMOCRED.md`

Before testing the application, please read the **DEMOCRED.md** file for demo credentials.

### 2. Captain Access

Only the following users can access the **Captain Dashboard**:

* Roll 2
* Roll 3

These two users are the **Captains**.

All other students are treated as **Normal Students** and cannot access captain-only routes.

---

# ✨ Features

### Student

* Secure Login & Authentication
* Submit bullying reports
* Track submitted reports
* Responsive dashboard
* Modern user interface

### Captain

* Captain-only protected routes
* View all reports
* Review reported incidents
* Manage report status
* Dashboard analytics

---

# 🛠 Tech Stack

## Frontend

* React 19
* React Router v7
* Tailwind CSS v4
* Motion (Framer Motion)
* GSAP
* React Hook Form
* TanStack React Query
* Axios
* Firebase Authentication
* Recharts
* Phosphor Icons
* Lucide React

## Backend

* Node.js
* Express.js
* MongoDB
* JWT Authentication

---

# 📦 Main Packages Used

```txt
Socket.io
React
React Router
TanStack React Query
Axios
Firebase
GSAP
Motion
Tailwind CSS
React Hook Form
Recharts
Lucide React
Phosphor Icons
```

---

# 📂 Project Structure

```text
project-root
│
├── client
│   ├── src
│   ├── public
│   └── package.json
│
├── server
│   ├── routes
│   ├── middleware
│   ├── controllers
│   ├── models
│   └── package.json
│
└── README.md
```

---

# ⚙️ Installation

Clone the repository

```bash
git clone <repository-url>
```

Go to the project

```bash
cd project-folder
```

Install dependencies

```bash
npm install
```

Run the frontend

```bash
npm run dev
```

Run the backend

```bash
npm start
```

---

# 🔐 Environment Variables

Create a `.env` file.

Example:

```env
VITE_API_URL=

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

MONGODB_URI=
JWT_SECRET=
```

---

# 👥 User Roles

## 👨‍🎓 Student

* Submit reports
* View personal reports
* Update profile
* Access student features

---

## 🛡 Captain

Only **Roll 2** and **Roll 3** can:

* Access Captain Dashboard
* Review reports
* Update report status
* Monitor incidents
* Manage student reports

---

# 📱 Responsive Design

The application is optimized for:

* Desktop
* Laptop
* Tablet
* Mobile

---

# 🎯 Future Improvements

* Email notifications
* AI-assisted report categorization
* Real-time notifications
* Evidence upload
* Chat support
* Admin analytics
* Audit logs

---

# 👨‍💻 Developed With

* React
* Node.js
* Express
* MongoDB
* Firebase
* Tailwind CSS

---

# 📄 License

This project is created for educational purposes.
