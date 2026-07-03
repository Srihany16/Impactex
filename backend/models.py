from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Boolean, func
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database1 import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    impact_score = Column(Float, default=0.0)
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    donations = relationship("Donation", back_populates="user")

class Charity(Base):
    __tablename__ = "charities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String)
    base_price = Column(Float, nullable=False)
    current_price = Column(Float, nullable=False)
    volatility_index = Column(Float, default=1.0)
    current_risk = Column(Float, default=1.0)
    decay_rate = Column(Float, default=0.05) # How fast price decays per hour
    last_updated = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    donations = relationship("Donation", back_populates="charity")

class MarketEvent(Base):
    __tablename__ = "market_events"
    id = Column(Integer, primary_key=True, index=True)
    charity_id = Column(Integer, ForeignKey("charities.id"))
    news_text = Column(String)
    sentiment_score = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    charity = relationship("Charity")

class Donation(Base):
    __tablename__ = "donations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    charity_id = Column(Integer, ForeignKey("charities.id"))
    amount_donated = Column(Float, nullable=False)
    price_at_donation = Column(Float, nullable=False)
    impact_earned = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="donations")
    charity = relationship("Charity", back_populates="donations")
