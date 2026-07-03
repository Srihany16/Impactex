import markovify

text_data = """
The charity has successfully launched a new global initiative today.
A major scandal has severely damaged the organization's reputation this week.
Funding for the environmental project has tripled this quarter.
Leadership changes are causing massive instability and project delays.
Millions of dollars were raised in the latest emergency relief drive.
Critics are questioning the effectiveness of the recent charity programs.
Breakthrough technologies are being deployed to save local wildlife.
The market is crashing for impact investments in this sector.
Unexpected donations have secured the future of the children's fund.
Fraud allegations are currently under investigation by authorities.
A new breakthrough in clean water technology was announced today.
The non-profit organization is facing severe budget cuts next year.
The founder resigned unexpectedly after a highly successful year.
Local governments have praised the charity's outstanding performance.
"""

text_model = markovify.Text(text_data, state_size=2)

def generate_ai_news() -> str:
    """Generates a random AI news headline using a Markov chain"""
    for _ in range(20):
        sentence = text_model.make_sentence(tries=100)
        if sentence:
            return sentence
    return "The charity announced new developments today."
