# 💘 Collexa

A campus dating app exclusively for IIT Mandi students.  
🌐 Live: https://collexa.online  

---

## 🚀 Overview

Collexa allows IIT Mandi students to discover, match, and chat securely using their institute email (`@iitmandi.ac.in`).

---

## 🛠 Tech Stack

- **Frontend:** React + Vite + Tailwind CSS  
- **Backend:** Node.js + Express.js  
- **Database:** MongoDB Atlas  
- **Storage:** AWS S3  
- **Real-time:** Socket.IO  
- **Auth:** JWT + Email OTP  
- **Deployment:** AWS EC2 + Nginx + PM2 + SSL  

---

## ✨ Features

- Swipe (Like / Pass)  
- Match system (mutual likes)  
- Real-time chat (text, emoji, images, files, voice)  
- Seen ticks (✓✓)  
- Delete messages (me / everyone)  
- Bulk delete & clear chat  
- Block / Unblock users  
- Online / Offline status  
- Push notifications (in-app + browser)  
- User profiles (photos, bio, interests, course, branch, year)  

---

## 📁 Project Structure

```
Collexa/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
└── frontend/
    └── src/
        ├── pages/
        ├── components/
        ├── context/
        └── utils/
```

---

## ⚙️ Local Setup

### Backend

```bash
cd backend
npm install
# create .env (refer .env.example)
node server.js
```

### Frontend

```bash
cd frontend
npm install
# create .env
# VITE_SOCKET_URL=http://localhost:5000
npm run dev
```

---

Built with 💘 by **Pramesh**
