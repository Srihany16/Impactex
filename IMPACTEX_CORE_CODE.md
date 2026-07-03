# ImpactEx Core Code Bundle

> Consolidated from the uploaded ImpactEx project and cross-checked against the files listed in the ChatGPT hackathon project.

## Cross-check summary

- Chat files found locally: `.env`, `auth.py`, `auth_verif.py`, `database1.py`, `db.py`, `main.py`, `models.py`, and `security.py`.
- The blank init file is now correctly named `backend/__init__.py`.
- `requirements.txt` is populated with the backend dependencies.
- Local uploaded files are treated as the authoritative/latest copies.
- Secret values from `.env` and `.env.local` are intentionally excluded.
- Generated dependencies and artifacts such as `node_modules`, `package-lock.json`, `__pycache__`, and `dist` are intentionally excluded.

## Environment template

~~~env
GEMINI_API_KEY=your_gemini_api_key_here
AUTH_DATABASE_URL=postgresql://user:password@localhost/auth_db
IMPACT_DATABASE_URL=postgresql://user:password@localhost/impact_db
JWT_SECRET=replace_with_a_long_random_secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
~~~

## Included source files

- `backend/auth.py`
- `backend/auth_verif.py`
- `backend/database1.py`
- `backend/db.py`
- `backend/main.py`
- `backend/models.py`
- `backend/security.py`
- `src/App.tsx`
- `src/constants.tsx`
- `src/index.tsx`
- `src/types.ts`
- `components/AuthPage.tsx`
- `components/Dashboard.tsx`
- `components/Hero.tsx`
- `components/InsightsPanel.tsx`
- `components/Navbar.tsx`
- `components/ProfilePage.tsx`
- `components/SettingsPage.tsx`
- `MarketGrid.tsx`
- `MarketTicker.tsx`
- `index.css`
- `index.html`
- `package.json`
- `requirements.txt`
- `vite.config.ts`
- `tsconfig.json`
- `start-all.bat`
- `start-backend.bat`
- `start-frontend.bat`

## `backend/auth.py`

~~~python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database1 import get_db
from models import User
from security import (
    hash_password,
    verify_password,
    create_access_token
)

router = APIRouter(prefix="/auth", tags=["auth"])

class AuthRequest(BaseModel):
    email: str
    password: str

@router.post("/signup")
def signup(data: AuthRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")

    user = User(
        email=data.email,
        password=hash_password(data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {"message": "User created"}

@router.post("/login")
def login(data: AuthRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(user.id)})

    return {
        "access_token": token,
        "token_type": "bearer"
    }
~~~

## `backend/auth_verif.py`

~~~python
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
import jwt
import os

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = os.getenv("ALGORITHM")

def get_current_user_id(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
~~~

## `backend/database1.py`

~~~python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
import os

DATABASE_URL = os.getenv("AUTH_DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
~~~

## `backend/db.py`

~~~python
import psycopg2
import os

def get_conn():
    return psycopg2.connect(os.getenv("IMPACT_DATABASE_URL"))
~~~

## `backend/main.py`

~~~python
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from db import get_conn
from auth import router as auth_router
from auth_verif import get_current_user_id
from database1 import engine
from models import Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="ImpactX Backend")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)

@app.get("/")
def root():
    return {"status": "Backend running 🚀"}

@app.get("/protected")
def protected(user_id: str = Depends(get_current_user_id)):
    return {"user_id": user_id}
~~~

## `backend/models.py`

~~~python
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime, timezone
from database1 import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
~~~

## `backend/security.py`

~~~python
from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt
import os

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

SECRET_KEY = os.getenv("JWT_SECRET")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(password: str, hashed_password: str):
    return pwd_context.verify(password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})
    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )
~~~

## `src/App.tsx`

~~~tsx

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import InsightsPanel from '../components/InsightsPanel';
import Dashboard from '../components/Dashboard';
import AuthPage from '../components/AuthPage';
import ProfilePage from '../components/ProfilePage';
import SettingsPage from '../components/SettingsPage';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'portfolio' | 'login' | 'signup' | 'profile' | 'settings'>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [scrollY, setScrollY] = useState(0);
  const hubRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToHub = () => {
    hubRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLoginSuccess = (name: string) => {
    setUserName(name);
    setIsLoggedIn(true);
    setView('portfolio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName('');
    setView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    if (view === 'login' || view === 'signup') {
      return (
        <AuthPage 
          mode={view as 'login' | 'signup'} 
          onLoginSuccess={handleLoginSuccess}
          onSwitchMode={setView}
        />
      );
    }

    if (view === 'portfolio') {
      return <Dashboard onBack={() => setView('home')} />;
    }

    if (view === 'profile') {
      return <ProfilePage userName={userName} onBack={() => setView('portfolio')} />;
    }

    if (view === 'settings') {
      return <SettingsPage onBack={() => setView('portfolio')} />;
    }

    return (
      <div className="relative">
        {/* Section 1: Sticky Hero */}
        <div className="sticky-hero overflow-hidden">
           <Hero scrollY={scrollY} onExplore={scrollToHub} />
        </div>

        {/* Section 2: Flowing Content Overlay */}
        <main className="content-overlay" ref={hubRef}>
          <section className="max-w-[1600px] mx-auto px-8 md:px-16 py-32">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
              
              {/* Column 1: Operative Insights */}
              <div className="space-y-16">
                <div className="text-left">
                   <h2 className="text-6xl font-serif italic text-white mb-6 text-lowercase leading-none">how we <br/> operate.</h2>
                   <p className="text-white/70 text-xl max-w-sm text-lowercase leading-tight">all based on calculated insights. we bridge the gap between intent and measurable results.</p>
                </div>

                <div className="space-y-12">
                  <div className="flex gap-8 items-start group">
                    <div className="text-4xl font-serif italic text-white opacity-20 group-hover:opacity-60 transition-all">01</div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-white text-lowercase">choose your charity</h3>
                      <p className="text-white/60 text-lg text-lowercase leading-snug max-w-[280px]">browse verified projects vetted for transparency and direct effectiveness.</p>
                    </div>
                  </div>

                  <div className="flex gap-8 items-start group">
                    <div className="text-4xl font-serif italic text-white opacity-20 group-hover:opacity-60 transition-all">02</div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-white text-lowercase">donate for a cause</h3>
                      <p className="text-white/60 text-lg text-lowercase leading-snug max-w-[280px]">allocate funds to specific outcomes. your contribution is converted into tangible impact units.</p>
                    </div>
                  </div>

                  <div className="flex gap-8 items-start group">
                    <div className="text-4xl font-serif italic text-white opacity-20 group-hover:opacity-60 transition-all">03</div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-white text-lowercase">earn impacts</h3>
                      <p className="text-white/60 text-lg text-lowercase leading-snug max-w-[280px]">track your personal contribution feed. see exactly where every dollar goes in real-time.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2 & 3: Insights Panel Components */}
              <InsightsPanel />
              
            </div>
          </section>
        </main>

        {/* Floating Get Started Button */}
        {!isLoggedIn && scrollY > 400 && (
          <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 duration-500">
            <button 
              onClick={() => setView('login')}
              className="px-12 py-5 bg-[#e05c9d] text-white rounded-full font-black text-sm uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(224,92,157,0.4)] hover:scale-105 transition-all active:scale-95"
            >
              get started
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar 
        onNavigate={setView} 
        activeView={view} 
        scrollY={scrollY} 
        isLoggedIn={isLoggedIn}
        userName={userName}
        onLogout={handleLogout}
      />
      
      {renderContent()}

      <footer className="border-t border-white/10 py-32 bg-[#1e2a5e] text-white">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-16">
          <div className="font-bold text-4xl tracking-tighter">
            <span className="text-lowercase">impact</span><span className="text-[#f97099] font-light text-lowercase">ex</span>
          </div>
          <p className="text-white/40 text-center max-w-md text-2xl text-lowercase">earn impacts. donate today. all based on calculated insights.</p>
          <div className="flex gap-16">
            <a href="#" className="text-sm font-bold hover:text-[#f97099] transition-colors uppercase tracking-[0.5em] text-lowercase">about</a>
            <a href="#" className="text-sm font-bold hover:text-[#f97099] transition-colors uppercase tracking-[0.5em] text-lowercase">trust</a>
            <a href="#" className="text-sm font-bold hover:text-[#f97099] transition-colors uppercase tracking-[0.5em] text-lowercase">legal</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
~~~

## `src/constants.tsx`

~~~tsx

import { ImpactProject } from './types';

export const IMPACT_PROJECTS: ImpactProject[] = [
  {
    id: '1',
    projectCode: 'FOREST',
    name: 'Amazon Reforestation',
    category: 'Environment',
    costPerOutcome: 12.50,
    unitName: 'Trees Planted',
    efficiencyRating: 98,
    description: 'Direct capital for indigenous-led planting programs in the Amazon basin. We utilize satellite verification to ensure every seedling thrives.',
    totalOutcomes: 1245000,
    fundingTarget: '$15.5M',
    campaigns: [
      { id: 'c1', name: 'Xingu Basin Re-wilding', status: 'active', goal: '500k Trees' },
      { id: 'c2', name: 'Satellite Monitoring Phase II', status: 'funding', goal: '$200k' }
    ]
  },
  {
    id: '2',
    projectCode: 'READ',
    name: 'Rural Literacy Initiative',
    category: 'Education',
    costPerOutcome: 45.00,
    unitName: 'Months of Schooling',
    efficiencyRating: 92,
    description: 'Providing digital learning kits and trained educators to remote villages. Focused on long-term systemic improvement of rural educational infrastructure.',
    totalOutcomes: 89000,
    fundingTarget: '$4.0M',
    campaigns: [
      { id: 'c3', name: 'Mobile Library Units', status: 'active', goal: '20 Villages' },
      { id: 'c4', name: 'E-Reader Distribution Drive', status: 'completed', goal: '5k Units' }
    ]
  },
  {
    id: '3',
    projectCode: 'CLEAN',
    name: 'Ocean Plastic Recovery',
    category: 'Environment',
    costPerOutcome: 2.20,
    unitName: 'KG of Plastic Removed',
    efficiencyRating: 95,
    description: 'Autonomous barrier systems capturing ocean-bound plastic in major rivers. We turn waste into verified impact units through circular economy loops.',
    totalOutcomes: 3400000,
    fundingTarget: '$7.4M',
    campaigns: [
      { id: 'c5', name: 'Great Pacific Patch Recovery', status: 'active', goal: '100 Tons' },
      { id: 'c6', name: 'River Trash Fence #4', status: 'funding', goal: '$45k' }
    ]
  },
  {
    id: '4',
    projectCode: 'WATER',
    name: 'Clean Water Access',
    category: 'Infrastructure',
    costPerOutcome: 150.00,
    unitName: 'People Served Yearly',
    efficiencyRating: 89,
    description: 'Borehole construction and solar-powered filtration in drought-prone areas. Every well is fitted with IoT sensors for real-time flow monitoring.',
    totalOutcomes: 12000,
    fundingTarget: '$1.8M',
    campaigns: [
      { id: 'c7', name: 'Solar Desalination Pilot', status: 'active', goal: '1k People' },
      { id: 'c8', name: 'Maintenance Tech Training', status: 'funding', goal: '$12k' }
    ]
  }
];
~~~

## `src/index.tsx`

~~~tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
~~~

## `src/types.ts`

~~~typescript

export interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'funding' | 'completed';
  goal: string;
}

export interface ImpactProject {
  id: string;
  projectCode: string;
  name: string;
  category: 'Environment' | 'Education' | 'Health' | 'Infrastructure';
  costPerOutcome: number;
  unitName: string;
  efficiencyRating: number;
  description: string;
  totalOutcomes: number;
  fundingTarget: string;
  campaigns?: Campaign[];
}

export interface PortfolioItem {
  project: ImpactProject;
  unitsContributed: number;
  totalDonated: number;
}
~~~

## `components/AuthPage.tsx`

~~~tsx

import React, { useState } from 'react';

interface AuthPageProps {
  mode: 'login' | 'signup';
  onLoginSuccess: (userName: string) => void;
  onSwitchMode: (mode: 'login' | 'signup') => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ mode, onLoginSuccess, onSwitchMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleTestLogin = () => {
    onLoginSuccess('Team Pentagon');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-8 hero-gradient">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-3xl border border-white/20 p-12 rounded-[40px] shadow-2xl space-y-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-2">
          <h2 className="text-5xl font-serif italic text-[#1e2a5e] text-lowercase">
            {mode === 'login' ? 'welcome back.' : 'join the market.'}
          </h2>
          <p className="text-[#1e2a5e]/60 text-sm font-bold uppercase tracking-[0.3em]">
            {mode === 'login' ? 'access your impact portfolio' : 'start your impact journey'}
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#1e2a5e]/40 ml-4">email address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-8 py-5 bg-white/20 border border-white/40 rounded-full focus:outline-none focus:border-[#1e2a5e] transition-colors placeholder:text-[#1e2a5e]/20"
              placeholder="name@agency.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#1e2a5e]/40 ml-4">password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-8 py-5 bg-white/20 border border-white/40 rounded-full focus:outline-none focus:border-[#1e2a5e] transition-colors placeholder:text-[#1e2a5e]/20"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="space-y-4">
          <button className="w-full py-5 bg-[#1e2a5e] text-white rounded-full font-black text-lg hover:scale-[1.02] transition-transform shadow-xl text-lowercase">
            {mode === 'login' ? 'authenticate' : 'create account'}
          </button>
          
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-[1px] bg-[#1e2a5e]/10"></div>
            <span className="text-[10px] font-black text-[#1e2a5e]/20 uppercase tracking-widest">or</span>
            <div className="flex-1 h-[1px] bg-[#1e2a5e]/10"></div>
          </div>

          <button 
            onClick={handleTestLogin}
            className="w-full py-5 border-2 border-[#e05c9d] text-[#e05c9d] rounded-full font-black text-lg hover:bg-[#e05c9d] hover:text-white transition-all text-lowercase group flex items-center justify-center gap-3"
          >
            <span>test login: team pentagon</span>
            <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">→</span>
          </button>
        </div>

        <div className="text-center">
          <button 
            onClick={() => onSwitchMode(mode === 'login' ? 'signup' : 'login')}
            className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1e2a5e]/60 hover:text-[#e05c9d] transition-colors"
          >
            {mode === 'login' ? "don't have an account? sign up" : "already a member? log in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
~~~

## `components/Dashboard.tsx`

~~~tsx

import React, { useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { IMPACT_PROJECTS } from '../src/constants';
import { ImpactProject } from '../src/types';

const performanceData = [
  { month: 'jan', score: 120 },
  { month: 'feb', score: 180 },
  { month: 'mar', score: 160 },
  { month: 'apr', score: 240 },
  { month: 'may', score: 380 },
  { month: 'jun', score: 420 },
  { month: 'jul', score: 550 },
];

const allocationData = [
  { name: 'environment', value: 45 },
  { name: 'education', value: 25 },
  { name: 'health', value: 20 },
  { name: 'infra', value: 10 },
];

const COLORS = ['#1e2a5e', '#e05c9d', '#f4d89f', '#bdc69a'];

interface DashboardProps {
  onBack?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onBack }) => {
  const [selectedProject, setSelectedProject] = useState<ImpactProject | null>(null);

  const renderDetailView = (project: ImpactProject) => (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="space-y-6">
          <button 
            onClick={() => setSelectedProject(null)}
            className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/40 hover:text-[#e05c9d] transition-colors flex items-center gap-2"
          >
            <span className="text-lg">←</span> back to portfolio overview
          </button>
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-[#e05c9d] uppercase tracking-[0.3em]">{project.projectCode} / {project.category}</span>
            <h1 className="text-8xl font-serif italic leading-none text-lowercase">{project.name}.</h1>
          </div>
          <p className="text-2xl text-white font-medium text-lowercase tracking-tight max-w-2xl leading-tight">
            {project.description}
          </p>
        </div>
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-12 text-right space-y-8 min-w-[300px]">
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-2">efficiency rating</p>
              <p className="text-7xl font-bold tracking-tighter text-[#bdc69a]">{project.efficiencyRating}%</p>
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-2">unit cost</p>
              <p className="text-5xl font-bold tracking-tighter">${project.costPerOutcome.toFixed(2)}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <h2 className="text-4xl font-serif italic text-white text-lowercase">strategic campaigns.</h2>
              <div className="flex-1 h-[1px] bg-white/10"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.campaigns?.map((campaign) => (
                <div key={campaign.id} className="p-10 bg-black/40 backdrop-blur-xl border border-white/10 space-y-6 group hover:border-[#e05c9d]/40 transition-all">
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-bold text-lowercase leading-tight">{campaign.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${campaign.status === 'active' ? 'bg-[#bdc69a] text-black' : 'bg-white/10 text-white/40'}`}>
                      {campaign.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] text-white/40 uppercase font-black tracking-widest">impact target</p>
                    <p className="text-4xl font-mono font-bold">{campaign.goal}</p>
                  </div>
                  <button className="w-full py-4 bg-white text-black text-[10px] font-black uppercase tracking-[0.4em] hover:bg-[#e05c9d] hover:text-white transition-all">
                    allocate capital
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-12 bg-black/40 backdrop-blur-xl border border-white/10 space-y-8">
            <h2 className="text-2xl font-serif italic text-white text-lowercase">outcome projections.</h2>
            <div className="h-64 w-full opacity-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaDataDetail}>
                  <Area type="monotone" dataKey="val" stroke="#fff" fill="#fff" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-12">
          <div className="bg-[#0a0a0a] border border-white/5 p-12 space-y-10">
            <h3 className="text-xl font-serif italic text-lowercase">financials.</h3>
            <div className="space-y-6">
              <div className="flex justify-between border-b border-white/5 pb-4">
                 <span className="text-[10px] font-bold text-white/40 uppercase">funding target</span>
                 <span className="text-lg font-mono font-bold">{project.fundingTarget}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-4">
                 <span className="text-[10px] font-bold text-white/40 uppercase">verified outcomes</span>
                 <span className="text-lg font-mono font-bold">{project.totalOutcomes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-4">
                 <span className="text-[10px] font-bold text-white/40 uppercase">impact unit</span>
                 <span className="text-lg text-lowercase">{project.unitName}</span>
              </div>
            </div>
          </div>

          <div className="p-12 bg-[#e05c9d]/10 border border-[#e05c9d]/20 space-y-6">
             <h3 className="text-xl font-serif italic text-lowercase">impact risk.</h3>
             <p className="text-sm text-white/60 leading-relaxed text-lowercase">
               capital allocated to this project has a low-risk profile due to established infrastructure and redundant monitoring protocols.
             </p>
             <div className="h-1 w-full bg-white/10 rounded-full">
                <div className="h-full bg-[#bdc69a] w-[95%]"></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );

  const areaDataDetail = [
    { x: 0, val: 30 }, { x: 1, val: 45 }, { x: 2, val: 35 }, { x: 3, val: 60 }, { x: 4, val: 55 }, { x: 5, val: 80 }
  ];

  return (
    <main 
      className="min-h-screen text-white pt-40 pb-32 relative overflow-hidden" 
      style={{
        background: 'linear-gradient(to bottom, #e8a86c 0%, #d49055 15%, #c07840 30%, #8a5230 50%, #3a3a3a 70%, #000000 100%)'
      }}
    >
      <div className="max-w-7xl mx-auto px-8 space-y-16 relative z-10">
        
        {selectedProject ? renderDetailView(selectedProject) : (
          <>
            <div className="flex flex-col md:flex-row justify-between items-end gap-12 border-b border-white/10 pb-16">
              <div className="space-y-6">
                <button 
                  onClick={onBack}
                  className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/40 hover:text-[#e05c9d] transition-colors flex items-center gap-2"
                >
                  <span className="text-lg">←</span> back to home
                </button>
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#e05c9d]">authorized: team pentagon</p>
                  <h1 className="text-8xl font-serif italic leading-none text-lowercase">your portfolio.</h1>
                </div>
                <p className="text-xl text-white/40 font-medium text-lowercase tracking-tight max-w-lg">
                  pro-tier oversight of capital allocation and verified social outcomes. active since fiscal year 2024.
                </p>
              </div>
              <div className="text-right flex flex-col items-end">
                 <span className="px-4 py-1 border border-[#e05c9d] text-[#e05c9d] rounded-full text-[10px] font-bold uppercase tracking-[0.2em]">account verified</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-1">
              <div className="p-10 bg-black/40 backdrop-blur-xl border border-white/10 space-y-4">
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.4em] text-lowercase">net contribution</p>
                <p className="text-5xl font-bold tracking-tight">$4,250.00</p>
              </div>
              <div className="p-10 bg-black/40 backdrop-blur-xl border border-white/10 space-y-4">
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.4em] text-lowercase">impact units (iv)</p>
                <p className="text-5xl font-bold tracking-tight">2,108.4</p>
              </div>
              <div className="p-10 bg-black/40 backdrop-blur-xl border border-white/10 space-y-4">
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.4em] text-lowercase">conversion rate</p>
                <p className="text-5xl font-bold tracking-tight text-[#bdc69a]">94.2%</p>
              </div>
              <div className="p-10 bg-black/40 backdrop-blur-xl border border-white/10 space-y-4">
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.4em] text-lowercase">lives touched</p>
                <p className="text-5xl font-bold tracking-tight">1,420</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-8 space-y-12">
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-12 rounded-[2px] space-y-12">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-serif italic text-white text-lowercase">performance trajectory.</h2>
                      <p className="text-[10px] uppercase font-bold text-white/20 tracking-widest">impact value over time</p>
                    </div>
                    <div className="flex bg-white/5 rounded-sm p-1">
                      {['1d', '1w', '1m', 'max'].map(t => (
                        <button key={t} className={`px-4 py-1 text-[10px] font-bold uppercase tracking-widest ${t === 'max' ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-[450px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={performanceData}>
                        <defs>
                          <linearGradient id="impactGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#e05c9d" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#e05c9d" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="month" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '900'}}
                          dy={20}
                        />
                        <Tooltip 
                          contentStyle={{backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0px'}}
                          itemStyle={{color: '#e05c9d'}}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#e05c9d" 
                          strokeWidth={3} 
                          fillOpacity={1} 
                          fill="url(#impactGradient)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-serif italic text-white text-lowercase">active assets.</h2>
                    <div className="flex-1 h-[1px] bg-white/10"></div>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {IMPACT_PROJECTS.map((project) => (
                      <div 
                        key={project.id} 
                        onClick={() => setSelectedProject(project)}
                        className="flex items-center justify-between p-8 bg-black/40 backdrop-blur-xl border border-white/10 hover:border-white/50 transition-all group cursor-pointer hover:translate-x-2"
                      >
                        <div className="flex items-center gap-8">
                           <span className="text-[10px] font-black text-white/20 font-mono group-hover:text-[#e05c9d] transition-colors">{project.projectCode}</span>
                           <div>
                              <p className="font-bold text-lg text-lowercase">{project.name}</p>
                              <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest">{project.unitName}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-16 text-right">
                           <div className="hidden md:block">
                              <p className="text-[10px] text-white/20 uppercase font-black mb-1">efficiency</p>
                              <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                                 <div className="h-full bg-[#bdc69a]" style={{width: `${project.efficiencyRating}%`}}></div>
                              </div>
                           </div>
                           <div>
                              <p className="font-mono text-xl">${project.costPerOutcome.toFixed(2)}</p>
                              <p className="text-[10px] text-[#bdc69a] font-black uppercase">+{ (Math.random() * 10 + 2).toFixed(1) }% gain</p>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-12">
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-12 space-y-12">
                   <div className="space-y-1">
                     <h3 className="text-xl font-serif italic text-lowercase">sector mix.</h3>
                     <p className="text-[10px] uppercase font-bold text-white/20 tracking-widest">capital distribution</p>
                   </div>
                   <div className="h-64 w-full relative flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={allocationData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            {allocationData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.8} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute text-center space-y-1">
                         <p className="text-3xl font-mono font-bold">82.0</p>
                         <p className="text-[8px] uppercase font-black tracking-[0.4em] text-white/40">purity index</p>
                      </div>
                   </div>
                   <div className="space-y-4">
                      {allocationData.map((item, idx) => (
                        <div key={item.name} className="flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em]">
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}}></div>
                            <span className="text-white/40">{item.name}</span>
                          </div>
                          <span className="font-mono">{item.value}%</span>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-12 space-y-8">
                   <h3 className="text-xl font-serif italic text-lowercase">live ticker.</h3>
                   <div className="space-y-6">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex gap-4 items-start border-l border-white/10 pl-6 py-2">
                           <div className="w-1 h-1 mt-2 rounded-full bg-[#e05c9d] shadow-[0_0_10px_#e05c9d]"></div>
                           <div className="space-y-1">
                              <p className="text-white/80 font-bold text-[11px] text-lowercase leading-snug">system: verified 40.2kg plastic recovery / sector environment</p>
                              <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">{i * 2}m ago</p>
                           </div>
                        </div>
                      ))}
                   </div>
                   <button className="w-full py-4 bg-white text-black font-black text-[10px] uppercase tracking-[0.4em] hover:bg-[#e05c9d] hover:text-white transition-all">
                      open data logs
                   </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default Dashboard;
~~~

## `components/Hero.tsx`

~~~tsx

import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const chartData = [
  { x: 0, y: 40 }, { x: 1, y: 65 }, { x: 2, y: 45 }, { x: 3, y: 90 }, { x: 4, y: 75 }, { x: 5, y: 100 }
];

interface HeroProps {
  scrollY: number;
  onExplore?: () => void;
}

const Hero: React.FC<HeroProps> = ({ scrollY, onExplore }) => {
  const opacity = Math.max(0, 1 - scrollY / 600);
  const translateY = scrollY * 0.4;

  return (
    <div className="w-full h-full relative flex flex-col justify-center px-8 md:px-24 hero-gradient">
      {/* Background Decorative Data Flow */}
      <div className="absolute right-[-10%] bottom-0 w-3/4 h-3/4 opacity-10 pointer-events-none -rotate-6 translate-y-1/4">
         <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
               <Area type="monotone" dataKey="y" stroke="#1e2a5e" fill="#1e2a5e" fillOpacity={1} strokeWidth={8} />
            </AreaChart>
         </ResponsiveContainer>
      </div>

      <div 
        className="max-w-7xl w-full text-left space-y-10 relative z-10 transition-all duration-300"
        style={{ opacity, transform: `translateY(${translateY}px)` }}
      >
        <div className="space-y-0">
          <h1 className="text-6xl md:text-[120px] font-bold text-[#1e2a5e] leading-[0.9] tracking-tighter text-lowercase">
            earn <br />
            <span className="font-serif italic font-normal">impacts.</span>
          </h1>
          <p className="text-3xl md:text-[60px] font-black text-[#e05c9d] tracking-tighter text-lowercase leading-none mt-4">
            donate today.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start gap-6 pt-6">
          <button 
            onClick={onExplore}
            className="px-10 py-5 bg-[#1e2a5e] text-white rounded-full font-black text-lg hover:scale-105 transition-transform shadow-[0_20px_40px_-10px_rgba(30,58,94,0.3)] text-lowercase"
          >
            choose your charity
          </button>
          <button 
            onClick={onExplore}
            className="px-10 py-5 border-2 border-[#1e2a5e] text-[#1e2a5e] rounded-full font-black text-lg hover:bg-white/30 transition-colors text-lowercase"
          >
            see our insights
          </button>
        </div>
      </div>

      {/* scroll arrow indicator */}
      <div 
        className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6 transition-opacity duration-300"
        style={{ opacity: opacity * 0.4 }}
      >
        <div className="w-[2px] h-16 bg-gradient-to-b from-[#1e2a5e] to-transparent rounded-full animate-bounce"></div>
        <span className="text-xs uppercase font-black tracking-[0.6em] text-[#1e2a5e] text-lowercase opacity-60">scroll</span>
      </div>
    </div>
  );
};

export default Hero;
~~~

## `components/InsightsPanel.tsx`

~~~tsx

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area } from 'recharts';

const pieData = [
  { name: 'nature', value: 450 },
  { name: 'learning', value: 350 },
  { name: 'welfare', value: 250 },
  { name: 'systems', value: 150 },
];
// Colors from the branding palette
const COLORS = ['#1e2a5e', '#e05c9d', '#f4d89f', '#bdc69a'];

const areaData = [
  { x: 0, y: 50 }, { x: 1, y: 30 }, { x: 2, y: 70 }, { x: 3, y: 40 }, { x: 4, y: 90 }, { x: 5, y: 60 }
];

const InsightsPanel: React.FC = () => {
  return (
    <div className="contents">
      {/* Column 2: Choose what you impact */}
      <div className="bg-white/40 backdrop-blur-3xl p-12 rounded-[60px] relative overflow-hidden group border border-white/60 shadow-2xl animate-float lg:sticky lg:top-32">
        <div className="relative z-10">
          <h3 className="text-6xl font-serif italic text-[#1e2a5e] leading-[0.8] mb-8 text-lowercase">
            choose <br /> what you <br /> <span className="text-[#e05c9d] not-italic font-sans font-black">impact.</span>
          </h3>
          <p className="text-xl text-[#1e2a5e]/70 font-medium mb-12 leading-tight text-lowercase max-w-[240px]">
            every donation is backed by rigorous data. we ensure your capital goes exactly where it's needed most.
          </p>
          
          <div className="h-32 w-full mb-12 opacity-20">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={areaData}>
                  <Area type="stepBefore" dataKey="y" stroke="#1e2a5e" fill="#1e2a5e" fillOpacity={0.3} strokeWidth={5} />
               </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex -space-x-6">
                {[1, 2, 3, 4].map(i => (
                  <img key={i} src={`https://picsum.photos/seed/${i + 200}/100/100`} className="w-14 h-14 rounded-full border-2 border-white shadow-xl transition-transform hover:scale-110" alt="contributor" />
                ))}
            </div>
            <div>
                <p className="text-2xl font-black text-[#1e2a5e] tracking-tighter">24.8k+</p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1e2a5e]/40 text-lowercase">impact earners</p>
            </div>
          </div>
        </div>
      </div>

      {/* Column 3: Real-time tracking / Calculated Insights */}
      <div className="bg-[#1e2a5e] p-12 rounded-[60px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] text-white lg:sticky lg:top-32">
        <div className="mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/40 mb-3 text-lowercase">real-time tracking</p>
          <h4 className="text-5xl font-serif italic text-white text-lowercase leading-tight">calculated <br /> insights.</h4>
        </div>
        
        <div className="h-56 w-full mb-10 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={10}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute text-center bg-[#1e2a5e] w-20 h-20 flex flex-col justify-center rounded-full border-2 border-white/10">
             <p className="text-3xl font-serif italic">100</p>
             <p className="text-[8px] uppercase font-black tracking-widest text-white/40">% val</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {pieData.map((entry, index) => (
            <div key={entry.name} className="space-y-1 border-l-2 pl-4" style={{ borderColor: COLORS[index % COLORS.length] }}>
              <span className="font-bold text-white text-[10px] text-lowercase block opacity-60">{entry.name}</span>
              <p className="font-serif italic text-2xl text-white leading-none">{Math.round((entry.value / 1200) * 100)}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InsightsPanel;
~~~

## `components/Navbar.tsx`

~~~tsx

import React, { useState, useRef, useEffect } from 'react';

interface NavbarProps {
  onNavigate: (view: 'home' | 'portfolio' | 'login' | 'signup' | 'profile' | 'settings') => void;
  activeView: 'home' | 'portfolio' | 'login' | 'signup' | 'profile' | 'settings';
  scrollY: number;
  isLoggedIn: boolean;
  userName?: string;
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, activeView, scrollY, isLoggedIn, userName, onLogout }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const opacity = Math.min(scrollY / 200, 1);
  const blur = Math.min(scrollY / 10, 16);
  const bgColor = `rgba(30, 42, 94, ${opacity * 0.95})`;

  const isAuthPage = activeView === 'login' || activeView === 'signup';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav 
      className="fixed top-0 left-0 right-0 z-[100] px-12 py-6 flex justify-between items-center transition-all duration-300 border-b"
      style={{ 
        backgroundColor: bgColor,
        backdropFilter: `blur(${blur}px)`,
        borderColor: `rgba(255, 255, 255, ${opacity * 0.1})`,
        paddingTop: scrollY > 50 ? '1.5rem' : '2.5rem',
        paddingBottom: scrollY > 50 ? '1.5rem' : '2.5rem',
      }}
    >
      <div 
        className={`cursor-pointer font-bold text-3xl tracking-tighter flex items-center gap-1 group transition-colors duration-300 ${scrollY > 100 || isAuthPage ? 'text-white' : 'text-[#1e2a5e]'}`}
        onClick={() => {
          setIsDropdownOpen(false);
          onNavigate('home');
        }}
      >
        <span className="text-lowercase group-hover:italic transition-all">impact</span>
        <span className={`font-light text-lowercase ${scrollY > 100 || isAuthPage ? 'text-white/40' : 'text-[#1e2a5e]/40'}`}>ex</span>
      </div>
      
      <div className="flex items-center gap-12">
        {!isAuthPage && (
          <button 
            onClick={() => onNavigate('home')}
            className={`text-sm font-black tracking-[0.4em] uppercase transition-all text-lowercase pb-1 ${
              activeView === 'home' 
                ? `border-b-2 ${scrollY > 100 ? 'text-white border-white' : 'text-[#1e2a5e] border-[#1e2a5e]'}` 
                : `${scrollY > 100 ? 'text-white/60 hover:text-white' : 'text-[#1e2a5e]/60 hover:text-[#1e2a5e]'}`
            }`}
          >
            home
          </button>
        )}

        {isLoggedIn ? (
          <>
            <button 
              onClick={() => onNavigate('portfolio')}
              className={`text-sm font-black tracking-[0.4em] uppercase transition-all text-lowercase pb-1 ${
                activeView === 'portfolio' 
                  ? `border-b-2 ${scrollY > 100 ? 'text-white border-white' : 'text-[#1e2a5e] border-[#1e2a5e]'}` 
                  : `${scrollY > 100 ? 'text-white/60 hover:text-white' : 'text-[#1e2a5e]/60 hover:text-[#1e2a5e]'}`
              }`}
            >
              your portfolio
            </button>
            <div className="relative pl-4 border-l border-white/10" ref={dropdownRef}>
              <div 
                className="flex items-center gap-4 cursor-pointer group"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${scrollY > 100 ? 'text-white/60' : 'text-[#1e2a5e]/60'}`}>
                  {userName}
                </span>
                <div className={`w-10 h-10 rounded-full border p-1 flex items-center justify-center overflow-hidden transition-all group-hover:scale-110 ${scrollY > 100 ? 'bg-white/10 border-white/20' : 'bg-black/5 border-black/10'}`}>
                  <img src="https://picsum.photos/seed/team-pentagon/100/100" alt="avatar" className="w-full h-full rounded-full object-cover grayscale brightness-125" />
                </div>
              </div>

              {isDropdownOpen && (
                <div className="absolute top-14 right-0 w-64 bg-[#1e2a5e] border border-white/10 rounded-3xl p-6 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="space-y-4">
                    <button 
                      onClick={() => { onNavigate('profile'); setIsDropdownOpen(false); }}
                      className="w-full text-left text-[10px] font-black uppercase tracking-[0.4em] text-white/60 hover:text-white transition-colors"
                    >
                      impact profile
                    </button>
                    <button 
                      onClick={() => { onNavigate('settings'); setIsDropdownOpen(false); }}
                      className="w-full text-left text-[10px] font-black uppercase tracking-[0.4em] text-white/60 hover:text-white transition-colors"
                    >
                      market settings
                    </button>
                    <div className="h-[1px] bg-white/10 my-4"></div>
                    <button 
                      onClick={() => { if(onLogout) onLogout(); setIsDropdownOpen(false); }}
                      className="w-full text-left text-[10px] font-black uppercase tracking-[0.4em] text-[#e05c9d] hover:text-white transition-colors"
                    >
                      security protocol (exit)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-6">
            <button 
              onClick={() => onNavigate('login')}
              className={`text-[10px] font-black uppercase tracking-[0.4em] transition-colors ${scrollY > 100 || isAuthPage ? 'text-white hover:text-[#e05c9d]' : 'text-[#1e2a5e] hover:text-[#e05c9d]'}`}
            >
              log in
            </button>
            <button 
              onClick={() => onNavigate('signup')}
              className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.4em] transition-all border ${
                scrollY > 100 || isAuthPage 
                  ? 'bg-white text-[#1e2a5e] border-white hover:bg-transparent hover:text-white' 
                  : 'bg-[#1e2a5e] text-white border-[#1e2a5e] hover:bg-transparent hover:text-[#1e2a5e]'
              }`}
            >
              sign up
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
~~~

## `components/ProfilePage.tsx`

~~~tsx

import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { jsPDF } from "jspdf";

interface ProfilePageProps {
  userName: string;
  onBack: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userName, onBack }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress('accessing secure vaults...');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      setExportProgress('generating impact report...');
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a professional, structured Impact Investment Statement for "${userName}". 
        The report should be organized with the following sections:
        1. ACCOUNT OVERVIEW: Primary Sector: Environment, Tier: Visionary, Reach: 14 countries.
        2. VERIFIED MILESTONES: Ocean Guardian (Jul 2024), Reforest Vanguard (May 2024), Literacy Advocate (Dec 2023), System Pilot (Oct 2023).
        3. PERFORMANCE ANALYTICS: Efficiency Rating: 94.2%, Total Contribution Impact Units: 2,108.4.
        4. OPERATIVE SUMMARY: A 2-sentence sophisticated summary of their contribution to global social stock markets.
        The tone should be futuristic, precise, and professional. Do not use markdown bolding like **, use plain text suitable for a PDF.`,
      });

      const reportText = response.text;
      
      if (reportText) {
        setExportProgress('compiling verified pdf...');
        await new Promise(r => setTimeout(r, 800));
        
        // Initialize PDF
        const doc = new jsPDF();
        
        // Brand Header
        doc.setFillColor(30, 42, 94); // #1e2a5e
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text("impact ex", 15, 25);
        
        doc.setFontSize(10);
        doc.text("OFFICIAL IMPACT STATEMENT // " + new Date().toLocaleDateString(), 15, 33);
        
        // Content
        doc.setTextColor(30, 42, 94);
        doc.setFontSize(18);
        doc.text(`Statement for ${userName}`, 15, 55);
        
        doc.setFontSize(11);
        const splitText = doc.splitTextToSize(reportText, 180);
        doc.text(splitText, 15, 70);
        
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("This document is cryptographically verified by the ImpactEx Protocol.", 15, 280);
        
        // Save
        doc.save(`ImpactEx_Statement_${userName.replace(/\s+/g, '_')}.pdf`);
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("System sync error during export. Please re-authenticate.");
    } finally {
      setIsExporting(false);
      setExportProgress('');
    }
  };

  return (
    <div className="min-h-screen pt-40 pb-32 px-12 hero-gradient">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-[#1e2a5e]/10 pb-12">
          <div className="space-y-6">
            <button 
              onClick={onBack}
              className="text-[10px] font-black uppercase tracking-[0.5em] text-[#1e2a5e]/40 hover:text-[#1e2a5e] transition-colors"
            >
              ← return to hub
            </button>
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#e05c9d]">authorized operative</span>
              <h1 className="text-8xl font-serif italic text-[#1e2a5e] text-lowercase leading-none">{userName}.</h1>
            </div>
          </div>
          <div className="bg-white/40 backdrop-blur-xl p-6 rounded-full border border-white/60 shadow-lg">
            <img src="https://picsum.photos/seed/team-pentagon/200/200" className="w-28 h-28 rounded-full grayscale brightness-125" alt="profile" />
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left/Main Column (8 spans) */}
          <div className="lg:col-span-8 space-y-10">
            {/* Impact Resume Section */}
            <section className="space-y-6">
              <h2 className="text-2xl font-serif italic text-[#1e2a5e] text-lowercase">impact resume.</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'ocean guardian', date: 'verified jul 2024', color: '#1e2a5e' },
                  { label: 'reforest vanguard', date: 'verified may 2024', color: '#bdc69a' },
                  { label: 'literacy advocate', date: 'verified dec 2023', color: '#f4d89f' },
                  { label: 'system pilot', date: 'verified oct 2023', color: '#e05c9d' },
                ].map((badge) => (
                  <div key={badge.label} className="p-10 bg-white/20 border border-white/40 rounded-[32px] space-y-5 group hover:bg-white/40 transition-all shadow-sm">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-inner" style={{ backgroundColor: badge.color }}>
                       <div className="w-5 h-5 rounded-full border border-white/30"></div>
                    </div>
                    <div>
                      <p className="font-bold text-xl text-[#1e2a5e] text-lowercase">{badge.label}</p>
                      <p className="text-[10px] font-black text-[#1e2a5e]/40 uppercase tracking-widest">{badge.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Identity Verification Section */}
            <section className="p-12 bg-[#1e2a5e] text-white rounded-[40px] shadow-2xl space-y-10">
              <h2 className="text-2xl font-serif italic text-lowercase border-b border-white/10 pb-6">identity verification.</h2>
              <div className="space-y-6">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em]">
                  <span className="text-white/40">biometric sync</span>
                  <span className="text-[#bdc69a] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#bdc69a] animate-pulse"></span>
                    active
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em]">
                  <span className="text-white/40">kyc compliance</span>
                  <span className="text-white">level 3 (max)</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em]">
                  <span className="text-white/40">capital source</span>
                  <span className="text-[#bdc69a]">verified</span>
                </div>
              </div>
            </section>
          </div>

          {/* Right Sidebar (4 spans) */}
          <div className="lg:col-span-4 space-y-10">
            {/* Account DNA Card */}
            <div className="p-12 bg-white/40 backdrop-blur-3xl border border-white/60 rounded-[40px] shadow-xl space-y-12">
               <h3 className="text-2xl font-serif italic text-[#1e2a5e] text-lowercase border-b border-[#1e2a5e]/10 pb-6">account dna.</h3>
               <div className="space-y-10">
                 <div>
                   <p className="text-[10px] font-black text-[#1e2a5e]/40 uppercase tracking-[0.3em] mb-2">primary sector</p>
                   <p className="text-3xl font-bold text-[#1e2a5e] text-lowercase tracking-tighter">environment</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-black text-[#1e2a5e]/40 uppercase tracking-[0.3em] mb-2">contribution tier</p>
                   <p className="text-3xl font-bold text-[#e05c9d] text-lowercase tracking-tighter">visionary</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-black text-[#1e2a5e]/40 uppercase tracking-[0.3em] mb-2">impact reach</p>
                   <p className="text-3xl font-bold text-[#1e2a5e] text-lowercase tracking-tighter">14 countries</p>
                 </div>
               </div>
            </div>

            <div className="p-8 border border-[#1e2a5e]/10 rounded-[40px] bg-black/5 flex items-center gap-4">
               <div className="w-3 h-3 rounded-full bg-[#bdc69a]"></div>
               <p className="text-[10px] font-black text-[#1e2a5e]/60 uppercase tracking-widest">encrypted link established</p>
            </div>
          </div>
        </div>

        {/* Data Export Button - Refined Size & Text Spacing */}
        <div className="pt-12 border-t border-[#1e2a5e]/5 flex justify-center">
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className={`group relative w-fit min-w-[400px] px-16 overflow-hidden py-6 rounded-full font-black text-[11px] uppercase tracking-[0.25em] transition-all duration-500 shadow-2xl ${
              isExporting 
                ? 'bg-[#1e2a5e]/20 text-[#1e2a5e] cursor-wait' 
                : 'bg-[#1e2a5e] text-white hover:bg-[#e05c9d] hover:-translate-y-1 active:scale-95'
            }`}
          >
            <span className="relative z-10 flex items-center justify-center gap-4">
              {isExporting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-[#1e2a5e]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {exportProgress}
                </>
              ) : 'request impact data (.pdf)'}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
~~~

## `components/SettingsPage.tsx`

~~~tsx

import React, { useState } from 'react';

interface SettingsPageProps {
  onBack: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
  const [notifications, setNotifications] = useState(true);
  const [privacy, setPrivacy] = useState(false);

  return (
    <div className="min-h-screen pt-40 pb-32 px-12 hero-gradient">
      <div className="max-w-4xl mx-auto space-y-16">
        <div className="space-y-6 border-b border-[#1e2a5e]/10 pb-12">
          <button 
            onClick={onBack}
            className="text-[10px] font-black uppercase tracking-[0.5em] text-[#1e2a5e]/40 hover:text-[#1e2a5e] transition-colors"
          >
            ← return to hub
          </button>
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#e05c9d]">protocol configuration</span>
            <h1 className="text-8xl font-serif italic text-[#1e2a5e] text-lowercase leading-none">settings.</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
          <div className="md:col-span-8 space-y-16">
            <section className="space-y-10">
              <div className="space-y-2">
                 <h2 className="text-3xl font-serif italic text-[#1e2a5e] text-lowercase">market notifications.</h2>
                 <p className="text-sm text-[#1e2a5e]/60 text-lowercase">how you receive real-time impact outcome alerts.</p>
              </div>
              
              <div className="space-y-6">
                {[
                  { label: 'outcome verified', desc: 'alerts when capital converts to verified units' },
                  { label: 'project milestone', desc: 'notifications for major project completions' },
                  { label: 'portfolio summary', desc: 'weekly analysis of your impact growth' }
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center p-8 bg-white/20 border border-white/40 rounded-3xl group hover:bg-white/40 transition-all">
                    <div className="space-y-1">
                      <p className="font-bold text-[#1e2a5e] text-lowercase">{item.label}</p>
                      <p className="text-[10px] font-black text-[#1e2a5e]/40 uppercase tracking-widest">{item.desc}</p>
                    </div>
                    <div 
                      onClick={() => setNotifications(!notifications)}
                      className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors ${notifications ? 'bg-[#bdc69a]' : 'bg-[#1e2a5e]/20'}`}
                    >
                      <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-10">
              <div className="space-y-2">
                 <h2 className="text-3xl font-serif italic text-[#1e2a5e] text-lowercase">market privacy.</h2>
                 <p className="text-sm text-[#1e2a5e]/60 text-lowercase">control who can see your impact trajectory.</p>
              </div>
              
              <div className="p-8 bg-white/20 border border-white/40 rounded-3xl flex justify-between items-center">
                <div className="space-y-1">
                  <p className="font-bold text-[#1e2a5e] text-lowercase">public impact feed</p>
                  <p className="text-[10px] font-black text-[#1e2a5e]/40 uppercase tracking-widest">show your verified wins on the global leaderboards</p>
                </div>
                <div 
                  onClick={() => setPrivacy(!privacy)}
                  className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors ${privacy ? 'bg-[#bdc69a]' : 'bg-[#1e2a5e]/20'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${privacy ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </div>
              </div>
            </section>
          </div>

          <div className="md:col-span-4 space-y-12">
            <div className="p-10 bg-[#1e2a5e] text-white rounded-[40px] space-y-8">
               <h3 className="text-xl font-serif italic text-lowercase">security vault.</h3>
               <div className="space-y-6">
                 <button className="w-full py-4 border border-white/20 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors">update credentials</button>
                 <button className="w-full py-4 border border-white/20 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors">biometric reset</button>
                 <button className="w-full py-4 bg-[#e05c9d] text-white text-[10px] font-black uppercase tracking-widest shadow-xl">deactivate account</button>
               </div>
            </div>

            <div className="p-10 border border-[#1e2a5e]/20 rounded-[40px] space-y-4">
               <p className="text-[10px] font-black text-[#1e2a5e]/40 uppercase tracking-widest">system version</p>
               <p className="font-mono text-[#1e2a5e] text-sm">v4.20.9-stable</p>
               <p className="text-[10px] text-[#1e2a5e]/60 text-lowercase leading-snug">last synchronized with the central exchange: 4 minutes ago.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
~~~

## `MarketGrid.tsx`

~~~tsx

import React from 'react';

const MarketGrid: React.FC = () => {
  return null; // Removed as per request
};

export default MarketGrid;
~~~

## `MarketTicker.tsx`

~~~tsx

import React from 'react';

const MarketTicker: React.FC = () => {
  return null; // Removed as per request
};

export default MarketTicker;
~~~

## `index.css`

~~~css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', sans-serif;
    background-color: #000;
    color: #1a1a1a;
    overflow-x: hidden;
}

.font-serif {
    font-family: 'Fraunces', serif;
}

.text-lowercase {
    text-transform: lowercase;
}

/* Exact gradient from the Claude template provided */
.hero-gradient {
    background: linear-gradient(135deg, 
        #f4d89f 0%, 
        #f0c28e 15%, 
        #ebb77d 30%, 
        #e8a86c 45%, 
        #ea9771 60%, 
        #ed8782 75%, 
        #f37b8f 85%, 
        #f97099 100%);
}

.sticky-hero {
    position: sticky;
    top: 0;
    height: 100vh;
    z-index: 1;
}

.content-overlay {
    position: relative;
    z-index: 2;
    background: linear-gradient(to bottom, #e8a86c 0%, #d49055 15%, #c07840 30%, #8a5230 50%, #3a3a3a 70%, #000000 100%);
    /* Shadow to indicate the overlay */
    box-shadow: 0 -30px 60px rgba(0,0,0,0.12);
}

@keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
}

.animate-float {
    animation: float 6s ease-in-out infinite;
}

@keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slide-in-from-bottom-8 {
    from { 
        opacity: 0; 
        transform: translateY(2rem);
    }
    to { 
        opacity: 1; 
        transform: translateY(0);
    }
}

@keyframes slide-in-from-bottom-10 {
    from { 
        opacity: 0; 
        transform: translateY(2.5rem);
    }
    to { 
        opacity: 1; 
        transform: translateY(0);
    }
}

@keyframes slide-in-from-top-4 {
    from { 
        opacity: 0; 
        transform: translateY(-1rem);
    }
    to { 
        opacity: 1; 
        transform: translateY(0);
    }
}

@keyframes zoom-in {
    from { 
        opacity: 0; 
        transform: scale(0.95);
    }
    to { 
        opacity: 1; 
        transform: scale(1);
    }
}

.animate-in {
    animation-duration: 0.5s;
    animation-fill-mode: both;
}

.fade-in {
    animation-name: fade-in;
}

.slide-in-from-bottom-8 {
    animation-name: slide-in-from-bottom-8;
}

.slide-in-from-bottom-10 {
    animation-name: slide-in-from-bottom-10;
}

.slide-in-from-top-4 {
    animation-name: slide-in-from-top-4;
}

.zoom-in {
    animation-name: zoom-in;
}

.duration-300 {
    animation-duration: 0.3s;
}

.duration-500 {
    animation-duration: 0.5s;
}

.duration-700 {
    animation-duration: 0.7s;
}
~~~

## `index.html`

~~~html

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>impact exchange | data-driven giving</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Fraunces:ital,wght@0,300;0,700;1,300;1,700&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Inter', sans-serif;
            background-color: #000;
            color: #1a1a1a;
            overflow-x: hidden;
        }
        .font-serif {
            font-family: 'Fraunces', serif;
        }
        .text-lowercase {
            text-transform: lowercase;
        }
        /* Exact gradient from the Claude template provided */
        .hero-gradient {
            background: linear-gradient(135deg, 
                #f4d89f 0%, 
                #f0c28e 15%, 
                #ebb77d 30%, 
                #e8a86c 45%, 
                #ea9771 60%, 
                #ed8782 75%, 
                #f37b8f 85%, 
                #f97099 100%);
        }
        
        .sticky-hero {
            position: sticky;
            top: 0;
            height: 100vh;
            z-index: 1;
        }
        
        .content-overlay {
            position: relative;
            z-index: 2;
            background: linear-gradient(to bottom, #e8a86c 0%, #d49055 15%, #c07840 30%, #8a5230 50%, #3a3a3a 70%, #000000 100%);
            /* Shadow to indicate the overlay */
            box-shadow: 0 -30px 60px rgba(0,0,0,0.12);
        }

        @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
        }
        .animate-float {
            animation: float 6s ease-in-out infinite;
        }
    </style>
<script type="importmap">
{
  "imports": {
    "recharts": "https://esm.sh/recharts@^3.7.0",
    "react-dom/": "https://esm.sh/react-dom@^19.2.3/",
    "react/": "https://esm.sh/react@^19.2.3/",
    "react": "https://esm.sh/react@^19.2.3",
    "@google/genai": "https://esm.sh/@google/genai@^1.38.0",
    "jspdf": "https://esm.sh/jspdf@^2.5.1"
  }
}
</script>
<link rel="stylesheet" href="/index.css">
</head>
<body>
    <div id="root"></div>
<script type="module" src="/src/index.tsx"></script>
</body>
</html>
~~~

## `package.json`

~~~json
{
  "name": "copy-of-impact-exchange",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "recharts": "^3.7.0",
    "react-dom": "^19.2.3",
    "react": "^19.2.3",
    "@google/genai": "^1.38.0",
    "jspdf": "^2.5.1"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "@vitejs/plugin-react": "^5.0.0",
    "typescript": "~5.8.2",
    "vite": "^6.2.0"
  }
}
~~~

## `requirements.txt`

~~~text
fastapi
uvicorn
sqlalchemy
psycopg2-binary
python-dotenv
passlib[bcrypt]
PyJWT
~~~

## `vite.config.ts`

~~~typescript
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
~~~

## `tsconfig.json`

~~~json
{
  "compilerOptions": {
    "target": "ES2022",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "module": "ESNext",
    "lib": [
      "ES2022",
      "DOM",
      "DOM.Iterable"
    ],
    "skipLibCheck": true,
    "types": [
      "node"
    ],
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "moduleDetection": "force",
    "allowJs": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": [
        "./*"
      ]
    },
    "allowImportingTsExtensions": true,
    "noEmit": true
  }
}
~~~

## `start-all.bat`

~~~batch
@echo off
echo ========================================
echo    ImpactEx - Complete Website Startup
echo ========================================
echo.
echo This will start both Frontend and Backend servers.
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8000
echo.
echo Press Ctrl+C to stop the servers
echo.
pause

start "ImpactEx Backend" cmd /k start-backend.bat
timeout /t 3 /nobreak > nul
start "ImpactEx Frontend" cmd /k start-frontend.bat

echo.
echo Both servers are starting...
echo Check the separate terminal windows for their status.
echo.
~~~

## `start-backend.bat`

~~~batch
@echo off
echo Starting ImpactEx Backend...
echo.
echo Installing Python dependencies...
pip install -r requirements.txt
echo.
echo Starting FastAPI server on http://localhost:8000
echo.
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
~~~

## `start-frontend.bat`

~~~batch
@echo off
echo Starting ImpactEx Frontend...
echo.
echo Installing dependencies...
call npm install
echo.
echo Starting development server on http://localhost:3000
echo.
call npm run dev
~~~
