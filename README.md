# ImpactEx - Data-Driven Charitable Giving Platform

A modern, full-stack web application that connects donors with verified charitable projects through a transparent, data-driven marketplace.

## 🌟 Features

- **Interactive Hero Section** with smooth scrolling animations
- **Portfolio Dashboard** with real-time impact tracking
- **User Authentication** system (login/signup)
- **Profile Management** with AI-generated impact reports
- **Settings Panel** for notifications and privacy
- **Data Visualization** using Recharts (charts, graphs, pie charts)
- **Backend API** built with FastAPI
- **Database Integration** with PostgreSQL

## 📁 Project Structure

```
velocity-hackathon-main/
├── src/
│   ├── App.tsx              # Main application component
│   ├── index.tsx            # React entry point
│   ├── types.ts             # TypeScript type definitions
│   └── constants.tsx        # Project data and constants
├── components/
│   ├── Navbar.tsx           # Navigation bar with user menu
│   ├── Hero.tsx             # Landing page hero section
│   ├── AuthPage.tsx         # Login/Signup page
│   ├── Dashboard.tsx        # Portfolio dashboard
│   ├── InsightsPanel.tsx    # Data insights component
│   ├── ProfilePage.tsx      # User profile page
│   └── SettingsPage.tsx     # Settings page
├── backend/
│   ├── main.py             # FastAPI application
│   ├── auth.py             # Authentication routes
│   ├── auth_verif.py       # JWT token verification
│   ├── database1.py        # Database connection & models
│   ├── db.py               # Additional database utilities
│   ├── models.py           # SQLAlchemy models
│   └── security.py         # Password hashing & JWT
├── index.html              # HTML template
├── index.css               # Global styles
├── package.json            # Frontend dependencies
├── requirements.txt        # Backend dependencies
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── start-frontend.bat      # Frontend startup script
├── start-backend.bat       # Backend startup script
└── start-all.bat           # Start both servers
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **PostgreSQL** database

### Environment Setup

1. Create a `.env` file in the root directory:

```env
# Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Database URLs
AUTH_DATABASE_URL=postgresql://user:password@localhost/auth_db
IMPACT_DATABASE_URL=postgresql://user:password@localhost/impact_db

# JWT Configuration
JWT_SECRET=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Installation & Running

#### Option 1: Run Everything at Once (Recommended)
```bash
start-all.bat
```

#### Option 2: Run Separately

**Frontend:**
```bash
start-frontend.bat
```

**Backend:**
```bash
start-backend.bat
```

#### Option 3: Manual Commands

**Frontend:**
```bash
npm install
npm run dev
```

**Backend:**
```bash
pip install -r requirements.txt
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

## 🎨 Technology Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast builds
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Google Gemini AI** for report generation
- **jsPDF** for PDF exports

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM for database
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Uvicorn** - ASGI server

## 🔐 Authentication

The app supports:
- User registration (signup)
- User login with JWT tokens
- Protected routes
- Test login with "Team Pentagon" account

## 📊 Features Breakdown

### 1. Hero Section
- Smooth parallax scrolling
- Animated data visualizations
- Call-to-action buttons

### 2. Dashboard
- Portfolio overview
- Performance charts
- Active project listings
- Sector allocation pie chart
- Live impact ticker

### 3. Profile Page
- Impact badges/achievements
- Account DNA metrics
- AI-generated PDF reports
- Identity verification status

### 4. Settings
- Notification preferences
- Privacy controls
- Security settings
- System information

## 🛠️ Development

### Adding New Components
1. Create component in `components/` directory
2. Import in `src/App.tsx`
3. Add to routing logic

### Adding Backend Routes
1. Create route in `backend/` directory
2. Import in `backend/main.py`
3. Register router

### Database Migrations
```bash
cd backend
# Create tables
python -c "from database1 import engine; from models import Base; Base.metadata.create_all(bind=engine)"
```

## 🐛 Troubleshooting

### Frontend Issues
- Clear node_modules: `rm -rf node_modules && npm install`
- Check port 3000 is available
- Verify environment variables

### Backend Issues
- Activate virtual environment if using one
- Check Python version: `python --version`
- Verify PostgreSQL is running
- Check database connection strings

### CORS Issues
Backend is configured to accept requests from:
- `http://localhost:3000`
- `http://127.0.0.1:3000`

## 📝 API Endpoints

### Authentication
- `POST /auth/signup` - Create new user
- `POST /auth/login` - Login and get JWT token

### Protected Routes
- `GET /protected` - Test protected route (requires auth)

## 🎯 Future Enhancements

- Payment integration
- Real-time notifications
- Advanced analytics
- Mobile app version
- Blockchain verification
- Multi-language support

## 📄 License

This project is part of a hackathon submission.

## 👥 Team

**Team Pentagon**

---

**Built with ❤️ for the Velocity Hackathon**
