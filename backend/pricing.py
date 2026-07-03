import random
from datetime import datetime, timezone
from models import Charity

def calculate_current_price(charity: Charity) -> float:
    """
    Calculates the current price based on time decay.
    Price decays linearly towards the base_price.
    """
    if charity.current_price <= charity.base_price:
        return charity.base_price

    now = datetime.now(timezone.utc)
    # Make sure last_updated is timezone aware
    last_updated = charity.last_updated
    if last_updated.tzinfo is None:
        last_updated = last_updated.replace(tzinfo=timezone.utc)
        
    hours_elapsed = (now - last_updated).total_seconds() / 3600.0
    
    decay_amount = (charity.current_price - charity.base_price) * charity.decay_rate * hours_elapsed
    new_price = charity.current_price - decay_amount
    
    return max(charity.base_price, new_price)

def process_donation_price(charity: Charity, amount: float) -> tuple[float, float]:
    """
    Process a donation: 
    1. Update the price using the decay formula first.
    2. Calculate impact based on new formula.
    3. Increase the price based on demand (amount * volatility * risk).
    Returns (new_price, impact_earned)
    """
    # 1. Decay the price to the current exact moment
    current_moment_price = calculate_current_price(charity)
    
    # 2. Calculate impact with random outcome
    base_impact = 100 * (charity.base_price / current_moment_price)
    # The multiplier scales with risk. Default risk is 1.0. 
    # Example: [-1.0, 1.5] meaning potential total loss or 150% gain
    outcome_multiplier = random.uniform(-1.0 * charity.current_risk, 1.5 * charity.current_risk)
    
    impact_earned = base_impact * outcome_multiplier
    
    # 3. Increase price due to demand
    price_increase = amount * charity.volatility_index * charity.current_risk
    new_price = current_moment_price + price_increase
    
    return new_price, impact_earned
