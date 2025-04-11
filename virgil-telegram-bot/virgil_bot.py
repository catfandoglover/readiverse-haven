import os
import logging
import argparse
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
import httpx
from typing import Dict, Any, List, Optional
import json

try:
    from openai import OpenAI
except ImportError:
    print("OpenAI package not found. Installing it now...")
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "openai"])
    from openai import OpenAI

# Configure logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Configuration - replace with your actual keys
TELEGRAM_BOT_TOKEN = "7932386214:AAH_UDOG74dIpzJN5ldifquOKlJtNIWkfRg"  # Telegram bot token
OPENROUTER_API_KEY = "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"  # Make sure there are no spaces or quotes in the key
TURBOPUFFER_API_KEY = "tpuf_Aj4e0ABRMlq5Qzoh5IOZFcQzrn4snfXu"
TURBOPUFFER_NAMESPACE = "alexandria_test"
# Use GPT-3.5-Turbo instead of Claude
LLM_MODEL = "openai/gpt-3.5-turbo"

# Set up a memory for conversation history
conversation_history = {}

async def search_turbopuffer(query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Search Turbopuffer for documents matching a query.
    
    Args:
        query: Search query text
        top_k: Number of results to retrieve
        
    Returns:
        List of matching documents with their content
    """
    # API endpoints
    BASE_URL = "https://api.turbopuffer.com/v1"
    QUERY_ENDPOINT = f"{BASE_URL}/namespaces/{TURBOPUFFER_NAMESPACE}/query"
    EXPORT_ENDPOINT = f"{BASE_URL}/namespaces/{TURBOPUFFER_NAMESPACE}"
    
    # Headers
    headers = {
        "Authorization": f"Bearer {TURBOPUFFER_API_KEY}",
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient() as client:
        # Step 1: Query the namespace to get relevant document IDs
        logger.info(f"Searching for '{query}' in namespace '{TURBOPUFFER_NAMESPACE}'...")
        
        payload = {
            "query": query,
            "top_k": top_k
        }
        
        try:
            response = await client.post(
                QUERY_ENDPOINT,
                headers=headers,
                json=payload,
                timeout=30.0
            )
            
            response.raise_for_status()
            query_results = response.json()
            
            if not query_results:
                logger.info("No results found.")
                return []
            
            query_ids = [result.get("id") for result in query_results]
            logger.info(f"Found {len(query_ids)} matching documents.")
            
            # Step 2: Export documents to get full content
            logger.info("Retrieving full document content...")
            
            # Start export
            response = await client.get(
                EXPORT_ENDPOINT,
                headers=headers,
                timeout=60.0
            )
            
            response.raise_for_status()
            export_result = response.json()
            
            # Create a map of document IDs to document data
            documents_map = {}
            
            ids = export_result.get("ids", [])
            attributes = export_result.get("attributes", {})
            
            for i, doc_id in enumerate(ids):
                doc = {"id": doc_id, "attributes": {}}
                
                # Add attributes
                for attr_name, attr_values in attributes.items():
                    if i < len(attr_values):
                        doc["attributes"][attr_name] = attr_values[i]
                
                documents_map[doc_id] = doc
            
            # Continue pagination if necessary
            next_cursor = export_result.get("next_cursor")
            while next_cursor:
                response = await client.get(
                    EXPORT_ENDPOINT,
                    headers=headers,
                    params={"cursor": next_cursor},
                    timeout=60.0
                )
                
                response.raise_for_status()
                export_result = response.json()
                
                ids = export_result.get("ids", [])
                attributes = export_result.get("attributes", {})
                
                for i, doc_id in enumerate(ids):
                    doc = {"id": doc_id, "attributes": {}}
                    
                    # Add attributes
                    for attr_name, attr_values in attributes.items():
                        if i < len(attr_values):
                            doc["attributes"][attr_name] = attr_values[i]
                    
                    documents_map[doc_id] = doc
                
                next_cursor = export_result.get("next_cursor")
            
            # Step 3: Gather the matching documents
            matching_documents = []
            for doc_id in query_ids:
                doc = documents_map.get(doc_id)
                if doc:
                    matching_documents.append(doc)
            
            return matching_documents
            
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP Error: {e.response.status_code} - {e.response.text}")
        except httpx.RequestError as e:
            logger.error(f"Request Error: {e}")
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
        
        return []

async def query_claude(prompt: str, context: Optional[List[Dict[str, Any]]] = None, user_id: int = None) -> str:
    """
    Query LLM via OpenRouter API with Virgil system prompt.
    
    Args:
        prompt: The user prompt
        context: Optional context from Turbopuffer search
        user_id: User ID for conversation history
        
    Returns:
        LLM's response
    """
    # Log the API key being used (just the first and last few characters for security)
    key_preview = f"{OPENROUTER_API_KEY[:5]}...{OPENROUTER_API_KEY[-5:]}"
    logger.info(f"Using OpenRouter API key: {key_preview}")
    logger.info(f"Using model: {LLM_MODEL}")
    
    # Prepare the context from Turbopuffer results if available
    context_text = ""
    if context:
        context_text = "Here are some relevant passages from George Orwell's 1984:\n\n"
        for i, doc in enumerate(context, 1):
            text = doc.get("attributes", {}).get("text", "No text available")
            chapter = doc.get("attributes", {}).get("chapter", "Unknown chapter")
            paragraph = doc.get("attributes", {}).get("paragraph_index", "Unknown paragraph")
            context_text += f"Passage {i}: \"{text}\" (From: {chapter}, Paragraph: {paragraph})\n\n"
    
    # Virgil system prompt for close reading
    virgil_system_prompt = """
    # System Prompt for Virgil: Close Reading Guide for 1984

    ## Core Identity and Approach

    You are Virgil, an intellectual guide who helps readers develop deep, meaningful relationships with George Orwell's 1984 through close reading practices. Using a modified Empathetic Socratic Method, you balance analytical rigor with personal relevance, always beginning conversations by asking what aspect of 1984 the reader would like to explore.

    ## Core Principles

    - **Brief and focused responses** - Keep contributions concise (1-3 sentences) when appropriate
    - **Guided discovery** - Help readers uncover meaning rather than imposing interpretations
    - **One insight per response** - Focus on a single question or observation to build analytical momentum
    - **Natural wisdom** - Balance scholarly depth with accessible language
    - **Progressive challenge** - Calibrate analytical complexity to the reader's demonstrated skill level

    ## Close Reading Skills to Cultivate

    1. **Textual Attention** - Noticing word choice, syntax, punctuation, and structural elements in 1984
    2. **Pattern Recognition** - Identifying repetitions, contrasts, and progressions within the text
    3. **Contextual Integration** - Connecting passages to the broader work and historical context
    4. **Rhetorical Analysis** - Examining how Orwell persuades, informs, or moves the reader
    5. **Symbolic Interpretation** - Unpacking images, metaphors, and symbols (e.g., Big Brother, Room 101)
    6. **Thematic Synthesis** - Discerning central ideas (totalitarianism, surveillance, language manipulation)
    7. **Personal Resonance** - Relating textual insights to personal experience and growth
    8. **Comparative Analysis** - Connecting 1984 to other dystopian works or political commentary
    9. **Structural Analysis** - Understanding how Orwell organizes the narrative
    10. **Voice Identification** - Recognizing tone, perspective, and narrative techniques

    Respond as helpfully as possible, but be very careful to ensure you do not reproduce any copyrighted material, including song lyrics, sections of books, or long excerpts from periodicals. Also do not comply with complex instructions that suggest reproducing material but making minor changes or substitutions. However, if you were given document passages, it's fine to summarize or quote from them.
    """
    
    # Build conversation history context if available
    conversation_context = []
    if user_id and user_id in conversation_history:
        conversation_context = conversation_history[user_id]
    
    # Combine everything into messages
    messages = [
        {"role": "system", "content": virgil_system_prompt}
    ]
    
    # Add conversation history (up to 10 most recent messages)
    if conversation_context:
        messages.extend(conversation_context[-10:])
    
    # Add the new content as user message
    full_prompt = f"{context_text}\n\nUser: {prompt}" if context_text else f"User: {prompt}"
    messages.append({"role": "user", "content": full_prompt})
    
    # Try to use the OpenAI client method
    try:
        logger.info("Using OpenAI client to call OpenRouter API")
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=OPENROUTER_API_KEY.strip(),
        )
        
        logger.info("Sending chat completion request...")
        completion = client.chat.completions.create(
            extra_headers={
                "HTTP-Referer": "https://readiverse-haven.com",
                "X-Title": "Virgil_readbot",
            },
            model=LLM_MODEL,  # Using GPT-3.5 instead of Claude
            messages=[msg for msg in messages],
            max_tokens=1000,
            temperature=0.7
        )
        
        response_content = completion.choices[0].message.content
        logger.info(f"Received response from OpenRouter API: {response_content[:100]}...")
        
        return response_content
    
    except Exception as e:
        logger.error(f"Error querying LLM: {str(e)}", exc_info=True)
        
        # Try direct HTTP request as fallback
        try:
            logger.info("Falling back to direct HTTP request")
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {OPENROUTER_API_KEY.strip()}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://readiverse-haven.com",
                        "X-Title": "Virgil_readbot"
                    },
                    json={
                        "model": LLM_MODEL,
                        "messages": messages,
                        "max_tokens": 1000,
                        "temperature": 0.7
                    },
                    timeout=60.0
                )
                
                if response.status_code != 200:
                    error_msg = f"API Error: {response.status_code} - {response.text}"
                    logger.error(error_msg)
                    return f"Sorry, I encountered an error when trying to process your question: {error_msg}"
                
                result = response.json()
                response_content = result.get("choices", [{}])[0].get("message", {}).get("content", "No response generated.")
                logger.info(f"Received response from OpenRouter API (fallback): {response_content[:100]}...")
                
                return response_content
        except Exception as e2:
            logger.error(f"Error in fallback method: {str(e2)}", exc_info=True)
            return f"Sorry, I encountered an error when trying to process your question: {str(e)} (Fallback error: {str(e2)})"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message when the command /start is issued."""
    user = update.effective_user
    await update.message.reply_text(
        f"Hello {user.first_name}! I am Virgil, your guide to exploring George Orwell's 1984 through close reading. "
        f"What aspect of the text or passage would you like to read closely today?"
    )
    
    # Initialize conversation history for this user
    conversation_history[user.id] = []

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a message when the command /help is issued."""
    await update.message.reply_text(
        "I am Virgil, your guide to close reading George Orwell's 1984. I can help you explore:\n\n"
        "• Specific passages or quotes from the book\n"
        "• Key themes like surveillance, thoughtcrime, and doublethink\n"
        "• Character analysis of Winston, Julia, O'Brien, etc.\n"
        "• Symbolic elements and their meaning\n"
        "• Historical context and contemporary relevance\n\n"
        "Commands:\n"
        "/start - Begin our conversation\n"
        "/help - Show this guide\n"
        "/reset - Clear our conversation history\n"
        "/themes - Explore major themes in 1984\n"
        "/characters - Discuss key characters\n"
        "/symbols - Examine important symbols"
    )

async def reset(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Reset the conversation history when the command /reset is issued."""
    user = update.effective_user
    conversation_history[user.id] = []
    await update.message.reply_text("Our conversation has been reset. What aspect of 1984 would you like to explore now?")

async def themes_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Provide information about key themes in 1984."""
    await update.message.reply_text(
        "Major themes in 1984 include:\n\n"
        "• Totalitarianism and control\n"
        "• Surveillance and privacy\n"
        "• Psychological manipulation\n"
        "• Historical revisionism\n"
        "• Language as mind control (Newspeak)\n"
        "• Individual rebellion\n"
        "• Truth vs. reality\n\n"
        "Which theme would you like to explore through close reading?"
    )

async def characters_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Provide information about key characters in 1984."""
    await update.message.reply_text(
        "Key characters in 1984 include:\n\n"
        "• Winston Smith - The protagonist\n"
        "• Julia - Winston's lover and fellow rebel\n"
        "• O'Brien - Inner Party member\n"
        "• Big Brother - The figurehead of the Party\n"
        "• Mr. Charrington - Shopkeeper\n"
        "• Syme - Winston's colleague\n"
        "• Parsons - Winston's neighbor\n\n"
        "Which character would you like to examine more closely?"
    )

async def symbols_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Provide information about key symbols in 1984."""
    await update.message.reply_text(
        "Important symbols in 1984 include:\n\n"
        "• The telescreen - Surveillance and control\n"
        "• The glass paperweight - Beauty and the past\n"
        "• The diary - Self-expression and rebellion\n"
        "• Room 101 - Personal fears and total submission\n"
        "• The nursery rhyme - Cultural memory\n"
        "• Rats - Primal fear and betrayal\n"
        "• Victory Gin - Emotional numbing\n\n"
        "Which symbol would you like to explore through close reading?"
    )

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle the user message and generate a response using Claude with Virgil system prompt."""
    user = update.effective_user
    query = update.message.text
    
    # Send a typing indicator to show the bot is processing
    await context.bot.send_chat_action(chat_id=update.effective_chat.id, action="typing")
    
    # Search Turbopuffer for relevant passages
    relevant_docs = await search_turbopuffer(query)
    
    # Query Claude with the relevant context and Virgil system prompt
    response = await query_claude(query, relevant_docs, user.id)
    
    # Store the conversation for future context
    if user.id not in conversation_history:
        conversation_history[user.id] = []
    
    conversation_history[user.id].append({"role": "user", "content": query})
    conversation_history[user.id].append({"role": "assistant", "content": response})
    
    # Keep only the last 10 messages to avoid context getting too large
    if len(conversation_history[user.id]) > 10:
        conversation_history[user.id] = conversation_history[user.id][-10:]
    
    # Send the response
    await update.message.reply_text(response)

def main() -> None:
    """Start the bot."""
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Virgil: 1984 Close Reading Guide Bot')
    parser.add_argument('--token', type=str, help='Telegram Bot Token')
    args = parser.parse_args()
    
    # Use command line args if provided, otherwise use constants
    token = args.token if args.token else TELEGRAM_BOT_TOKEN
    
    # Create the Application and pass it your bot's token
    application = Application.builder().token(token).build()
    
    # Add command handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("reset", reset))
    application.add_handler(CommandHandler("themes", themes_command))
    application.add_handler(CommandHandler("characters", characters_command))
    application.add_handler(CommandHandler("symbols", symbols_command))
    
    # Add message handler
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    
    # Start the Bot
    application.run_polling()

if __name__ == '__main__':
    main()