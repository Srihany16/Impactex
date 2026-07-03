from textblob import TextBlob

def analyze_sentiment(text: str) -> float:
    """
    Returns a polarity score between -1.0 (negative) and 1.0 (positive)
    """
    blob = TextBlob(text)
    return blob.sentiment.polarity
