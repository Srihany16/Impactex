from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from pydantic import BaseModel

from database1 import engine, get_db
from auth import router as auth_router
from auth_verif import get_current_user_id
from models import Base, Charity, User, Donation, MarketEvent
from pricing import calculate_current_price, process_donation_price
from sentiment import analyze_sentiment
from news_generator import generate_ai_news

Base.metadata.create_all(bind=engine)

app = FastAPI(title="ImpactX Backend")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
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

@app.get("/api/charities")
def get_charities(db: Session = Depends(get_db)):
    charities = db.query(Charity).all()
    results = []
    for c in charities:
        # Update current price using decay logic before returning
        new_price = calculate_current_price(c)
        if new_price != c.current_price:
            c.current_price = new_price
            c.last_updated = datetime.now(timezone.utc)
            db.commit()
            
        results.append({
            "id": c.id,
            "name": c.name,
            "description": c.description,
            "current_price": c.current_price,
            "base_price": c.base_price,
            "current_risk": c.current_risk
        })
    return results

class DonationRequest(BaseModel):
    charity_id: int
    amount: float

@app.post("/api/donate")
def donate(data: DonationRequest, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    charity = db.query(Charity).filter(Charity.id == data.charity_id).first()
    if not charity:
        raise HTTPException(status_code=404, detail="Charity not found")
        
    if data.amount < charity.current_price:
        raise HTTPException(status_code=400, detail=f"Minimum donation is {charity.current_price:.2f}")
        
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Process dynamic pricing
    new_price, impact_earned = process_donation_price(charity, data.amount)
    
    # Record the price they bought it at (before it increased from their demand)
    price_at_donation = new_price - (data.amount * charity.volatility_index * charity.current_risk)

    # Update charity
    charity.current_price = new_price
    charity.last_updated = datetime.now(timezone.utc)
    
    # Update user impact
    user.impact_score += impact_earned
    
    # Record donation
    donation = Donation(
        user_id=user.id,
        charity_id=charity.id,
        amount_donated=data.amount,
        price_at_donation=price_at_donation,
        impact_earned=impact_earned
    )
    db.add(donation)
    db.commit()
    
    return {
        "message": "Donation successful",
        "impact_earned": impact_earned,
        "new_charity_price": new_price,
        "total_impact_score": user.impact_score
    }

@app.get("/api/users/me")
def get_user_me(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "email": user.email,
        "impact_score": user.impact_score
    }

class NewsRequest(BaseModel):
    charity_id: int
    news_text: str

@app.get("/api/news/generate")
def get_ai_news():
    headline = generate_ai_news()
    return {"headline": headline}

@app.post("/api/news/impact")
def process_news_impact(data: NewsRequest, db: Session = Depends(get_db)):
    charity = db.query(Charity).filter(Charity.id == data.charity_id).first()
    if not charity:
        raise HTTPException(status_code=404, detail="Charity not found")
        
    score = analyze_sentiment(data.news_text)
    
    # Positive sentiment pumps the stock, Negative crashes it
    if score > 0.1:
        charity.current_risk = max(0.5, charity.current_risk - (score * 0.5))
        charity.base_price += score * 10
    elif score < -0.1:
        charity.current_risk = min(5.0, charity.current_risk + (abs(score) * 1.0))
        charity.base_price = max(1.0, charity.base_price - (abs(score) * 10))
        
    new_event = MarketEvent(
        charity_id=charity.id,
        news_text=data.news_text,
        sentiment_score=score
    )
    db.add(new_event)
    db.commit()
    
    return {
        "message": "Market updated based on news sentiment",
        "sentiment_score": score,
        "new_risk": charity.current_risk,
        "new_base_price": charity.base_price
    }

@app.get("/api/news/events")
def get_global_events(db: Session = Depends(get_db)):
    events = db.query(MarketEvent).order_by(MarketEvent.created_at.desc()).limit(10).all()
    
    result = []
    for e in events:
        result.append({
            "id": e.id,
            "charity_name": e.charity.name,
            "news_text": e.news_text,
            "sentiment_score": e.sentiment_score,
            "created_at": e.created_at.isoformat() if e.created_at else None
        })
    return result
