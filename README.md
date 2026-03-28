# 💘 Collexa

A dating app built exclusively for IIT Mandi students.
Live at — https://collexa.online

---

## What is this?

Collexa is a campus dating app where IIT students can discover, match, and chat with each other. Only `iitmandi.ac.in` email addresses are allowed.

---

## Stack

- **Frontend** — React + Vite + Tailwind CSS
- **Backend** — Node.js + Express.js
- **Database** — MongoDB Atlas
- **Storage** — AWS S3 (photos, files, voice messages)
- **Real-time** — Socket.IO
- **Auth** — JWT + Email OTP
- **Deployment** — AWS EC2 + Nginx + PM2 + SSL

---

## Features

- Swipe to like or pass on profiles
- Match when both users like each other
- Real-time chat with emoji, images, files, voice messages
- Message seen ticks ✓✓
- Delete messages — for me or for everyone
- Multi-select messages for bulk delete
- Clear chat
- Block / Unblock users
- Online / Offline status
- In-app + browser push notifications with sound
- Profile with photos, bio, interests, course, branch, year
- View other user's profile
- Terms & Conditions on signup

---

## Project Structure

Collexa/
├── backend/
│ ├── config/ db, mailer, s3
│ ├── controllers/ auth, profile, user, swipe, match, chat
│ ├── models/ User, Profile, Swipe, Match, Message
│ ├── routes/ auth, profile, users, swipe, matches, chat
│ ├── middleware/ auth, logger, errorHandler, upload
│ └── server.js
└── frontend/
└── src/
├── pages/ Login, Signup, Dashboard, Matches, Chat, Profile, BlockedUsers, UserProfile
├── components/ Navbar, SwipeCard, ProtectedRoute, Footer, ConfirmToast
├── context/ AuthContext, SocketContext
└── utils/ api.js


---

## Local Setup

**Backend**
cd backend
npm install
# create .env (see .env.example)
node server.js


**Frontend**

cd frontend
npm install
# create .env → VITE_SOCKET_URL=http://localhost:5000
npm run dev

Built with 💘 by Pramesh
