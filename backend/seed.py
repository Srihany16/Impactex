from database1 import engine, SessionLocal
from models import Base, Charity

# Make sure tables are created
Base.metadata.create_all(bind=engine)

def seed():
    db = SessionLocal()
    
    charities = [
        Charity(
            name='Amazon Reforestation',
            description='Direct capital for indigenous-led planting programs in the Amazon basin. We utilize satellite verification to ensure every seedling thrives.',
            base_price=12.50,
            current_price=12.50,
            volatility_index=0.1,
            current_risk=1.5,
            decay_rate=0.05
        ),
        Charity(
            name='Rural Literacy Initiative',
            description='Providing digital learning kits and trained educators to remote villages. Focused on long-term systemic improvement of rural educational infrastructure.',
            base_price=45.00,
            current_price=45.00,
            volatility_index=0.2,
            current_risk=2.0,
            decay_rate=0.05
        ),
        Charity(
            name='Ocean Plastic Recovery',
            description='Autonomous barrier systems capturing ocean-bound plastic in major rivers. We turn waste into verified impact units through circular economy loops.',
            base_price=2.20,
            current_price=2.20,
            volatility_index=0.05,
            current_risk=3.5,
            decay_rate=0.05
        ),
        Charity(
            name='Clean Water Access',
            description='Borehole construction and solar-powered filtration in drought-prone areas. Every well is fitted with IoT sensors for real-time flow monitoring.',
            base_price=150.00,
            current_price=150.00,
            volatility_index=0.5,
            current_risk=2.5,
            decay_rate=0.05
        )
    ]
    
    # Check if already seeded
    if db.query(Charity).count() == 0:
        db.add_all(charities)
        db.commit()
        print("Database seeded with charities!")
    else:
        print("Database already seeded.")
        
    db.close()

if __name__ == "__main__":
    seed()
