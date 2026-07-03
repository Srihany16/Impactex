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
from email_utils import send_verification_email
import uuid

router = APIRouter(prefix="/auth", tags=["auth"])

class AuthRequest(BaseModel):
    email: str
    password: str

@router.post("/signup")
def signup(data: AuthRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")

    token = str(uuid.uuid4())
    user = User(
        email=data.email,
        password=hash_password(data.password),
        verification_token=token
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    send_verification_email(user.email, token)

    return {"message": "User created. Please check your email to verify."}

@router.post("/login")
def login(data: AuthRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
        
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Please verify your email first. Check your inbox.")

    token = create_access_token({"sub": str(user.id)})

    return {
        "access_token": token,
        "token_type": "bearer"
    }

@router.get("/verify")
def verify_email(token: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.verification_token == token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired verification token")
        
    user.is_verified = True
    user.verification_token = None
    db.commit()
    return {"message": "Email verified successfully! You can now log in."}
