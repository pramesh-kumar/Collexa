# 💘 Collexa

A campus dating app exclusively for IIT Mandi students.  
🌐 Live: https://collexa.online  

---

## 🚀 Overview

Collexa allows IIT Mandi students to discover, match, and chat securely using their institute email. Only verified institute email holders can register.

---

## 🛠 Tech Stack

- **Frontend:** React + Vite + Tailwind CSS  
- **Backend:** Node.js + Express.js  
- **Database:** MongoDB Atlas  
- **Storage:** AWS S3  
- **Real-time:** Socket.IO  
- **Auth:** JWT + Email OTP  
- **Encryption:** Web Crypto API (RSA-OAEP)  
- **Deployment:** AWS EC2 + Nginx + PM2 + SSL  

---

## ✨ Features

- Swipe (Like / Pass) with drag support
- Filter discover by Stream + Year
- Match system (mutual likes)
- Real-time chat (text, emoji, images, files, voice)
- **End-to-End encrypted text messages** (RSA)
- Seen ticks (✓✓)
- Delete messages (me / everyone)
- Bulk delete & clear chat
- Block / Unblock users
- Online / Offline status
- Push notifications (in-app + browser + sound)
- User profiles (photos, bio, interests, course, stream, year, age)
- View other user's profile
- Delete account
- Terms & Conditions on signup
- **Forgot password** (OTP-based reset via email)
- Institute email validation

---

## 🔐 Security

- **E2E Encryption** — Text messages are end-to-end encrypted. The server only stores ciphertext; plaintext is never visible to the server.
- **Institute-restricted** — Only `@iitmandi.ac.in` email addresses are accepted. OTP verification ensures the user has real access to that inbox.
- **JWT Auth** — Tokens expire in 7 days. All protected routes require a valid token.

---

## 📁 Project Structure

```
Collexa/
├── backend/
│   ├── config/         # DB, mailer, S3
│   ├── controllers/    # auth, chat, match, profile, swipe, user
│   ├── models/         # User, Profile, Match, Swipe, Message
│   ├── routes/
│   ├── middleware/     # auth, error handler, logger, upload
│   └── server.js
└── frontend/
    └── src/
        ├── pages/      # Login, Signup, ForgotPassword, Dashboard, Chat, ...
        ├── components/
        ├── context/    # AuthContext, SocketContext
        └── utils/      # api.js, crypto.js
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
# create .env — leave VITE_SOCKET_URL unset for local dev (Vite proxy handles it)
# For production only: VITE_SOCKET_URL=https://collexa.online
npm run dev
```

> Note: E2E encryption requires HTTPS. On local HTTP, encryption is gracefully skipped.

---

## 🚀 Production Deployment (EC2)

```bash
cd ~/Collexa && git pull origin main
cd frontend && npm run build
cd ../backend && npm install
pm2 restart all
```

Make sure `frontend/.env` on EC2 has:
```
VITE_SOCKET_URL=https://collexa.online
```

---

Built with 💘 by **Pramesh**
