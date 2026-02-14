# Cupid - Modern Social Platform

A beautiful, modern friend-making platform built with React, Tailwind CSS, and Framer Motion.

## 🚀 Quick Start

### Run the Application

```bash
# Navigate to frontend
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

The app will open at: **http://localhost:5173**

## 📁 Project Structure

```
befriend-website/
├── frontend/              # React Application (Vite + Tailwind)
│   ├── src/
│   │   ├── components/   # Reusable React components
│   │   ├── pages/        # Page components
│   │   ├── context/      # Global state management
│   │   ├── data/         # Mock data
│   │   ├── App.jsx       # Main app with routing
│   │   └── main.jsx      # Entry point
│   ├── public/           # Static assets
│   ├── package.json      # Dependencies
│   └── vite.config.js    # Vite configuration
├── backend/              # Express + Socket.IO server
│   ├── server.js
│   ├── routes/
│   └── package.json
└── database/             # Database models
```

## 🎨 Features

### Pages
- **Discover** (`/`) - Swipe-based profile discovery with Tinder-style cards
- **HMU** (`/hmu`) - Share and discover spontaneous activities
- **Communities** (`/communities`) - Join interest-based groups
- **Messages** (`/messages`) - Real-time chat interface
- **Profile** (`/profile`) - User profile with photos and interests

### Design Features
- ✨ Glassmorphism effects
- 🎨 Animated purple/pink gradients
- 🎭 Smooth page transitions
- 📱 Mobile-first responsive design
- 🎯 Framer Motion animations

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Vite (Build tool)
- Tailwind CSS
- Framer Motion
- React Router
- React Icons

**Backend:**
- Express.js
- Socket.IO
- MongoDB (optional)
-c

## 💻 Development

### Frontend Development
```bash
cd frontend
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Backend Development
```bash
cd backend
npm install
npm start        # Start backend server (port 3000)
```

## 📦 Production Build

```bash
cd frontend
npm run build
```

Output: `frontend/dist/`

## 🚀 Deployment

### Option 1: Frontend Only (Netlify/Vercel)
1. Build the frontend: `cd frontend && npm run build`
2. Deploy the `frontend/dist/` folder

### Option 2: Full Stack (Render/Railway)
- Backend: Deploy as Node.js web service
- Frontend: Deploy as static site from `frontend/dist/`

## 🎯 Key Features

### Swipe Cards
- Drag gesture support
- Match notifications with animations
- User verification badges
- Interest tags

### Real-Time Chat
- Conversation list
- Message bubbles with gradients
- Online status indicators
- Send messages instantly

### Communities
- Responsive grid layout
- Join/leave functionality
- Search communities
- Member counts

## 📱 Responsive Design

Works perfectly on:
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)

## 🌟 What Makes It Special

- **Premium UI** - Glassmorphism, gradients, smooth animations
- **Modern Stack** - Latest React, Vite, Tailwind
- **Performance** - Lightning-fast with Vite
- **Clean Code** - Well-organized, maintainable
- **Responsive** - Mobile-first design

## 📝 Notes

- Mock data is used by default for development
- Socket.IO client is configured but needs backend connection
- Ready for backend integration with existing Express API

## 🆘 Troubleshooting

**Dev server won't start:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Build errors:**
- Make sure you're in the `frontend/` directory
- Check that all dependencies are installed
- Clear cache: `npm cache clean --force`

## 📄 License

MIT

---

**Built with ❤️ by mihir**

🎉 Ready to make friends!
