# Virgil Telegram Bot

A Telegram bot that serves as an intellectual guide to George Orwell's 1984, using Anthropic's Claude AI and Turbopuffer for context retrieval.

## Features

- Leverages Claude 3.5 Sonnet via OpenRouter API
- Uses Turbopuffer for semantic search against 1984 content
- Maintains conversation history for better contextual responses
- Includes predefined commands for exploring themes, characters, and symbols

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Replace API keys in `virgil_bot.py`:
   - `TELEGRAM_BOT_TOKEN`: Your Telegram bot token (get it from [@BotFather](https://t.me/BotFather))
   - `OPENROUTER_API_KEY`: Your OpenRouter API key
   - `TURBOPUFFER_API_KEY`: Your Turbopuffer API key
   - `TURBOPUFFER_NAMESPACE`: Your Turbopuffer namespace ID

## Usage

Start the bot with your Telegram token:

```
python virgil_bot.py --token YOUR_TELEGRAM_BOT_TOKEN
```

Or set the token in the script and run:

```
python virgil_bot.py
```

## Commands

- `/start` - Begin conversation
- `/help` - Show help information
- `/reset` - Clear conversation history
- `/themes` - Explore major themes
- `/characters` - Discuss key characters
- `/symbols` - Examine important symbols

## Requirements

- Python 3.7+
- Dependencies listed in `requirements.txt` 