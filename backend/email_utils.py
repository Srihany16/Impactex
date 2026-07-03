import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

def send_verification_email(to_email: str, token: str):
    verification_link = f"http://localhost:3000/?verify_token={token}"
    
    # If SMTP credentials are provided, send an actual email
    if SMTP_USER and SMTP_PASSWORD:
        try:
            msg = EmailMessage()
            msg.set_content(
                f"Welcome to ImpactEx!\n\n"
                f"Please verify your account by clicking the link below:\n"
                f"{verification_link}\n\n"
                f"If you did not request this, please ignore this email."
            )
            msg['Subject'] = "Verify your ImpactEx Account"
            msg['From'] = SMTP_USER
            msg['To'] = to_email

            with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.send_message(msg)
                
            print(f"Verification email successfully sent to {to_email}")
        except Exception as e:
            print(f"Failed to send email to {to_email}: {e}")
    else:
        # Mock mode if no credentials provided
        print("="*50)
        print("MOCK EMAIL DISPATCHER")
        print(f"To: {to_email}")
        print("Subject: Verify your ImpactEx Account")
        print(f"Link: {verification_link}")
        print("="*50)
