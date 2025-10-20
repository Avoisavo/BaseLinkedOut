# Telegram Bot Integration Guide

## How to Test the Telegram Bot Integration

### Step 1: Create a Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Start a chat and send `/newbot`
3. Follow the instructions:
   - Choose a name for your bot (e.g., "My Test Bot")
   - Choose a username (must end with 'bot', e.g., "mytestbot123_bot")
4. **BotFather will give you a bot token** that looks like:
   ```
   123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   ```
5. **Copy this token** - you'll need it in the next step

### Step 2: Connect Your Bot in the Application

1. Click **"Start with a Node"** on the flow canvas
2. Select **"On app event"**
3. Select **"Telegram"**
4. Select **"On message"** (or any other trigger)
5. In the credential modal:
   - Paste your bot token
   - Click **"Connect Bot"**
   - The system will verify your bot and show a success message

### Step 3: Start Listening for Messages

1. Once the node configuration opens, you'll see:
   - **Left panel**: Shows your bot info and status
   - **Middle panel**: Configuration options
   - **Right panel**: Message output
2. Click **"Start Listening"** button
3. You should see a green indicator: **"Listening for messages..."**

### Step 4: Send a Message to Your Bot

1. Open Telegram app
2. Search for your bot username (e.g., @mytestbot123_bot)
3. Start a chat with your bot
4. Send any message (e.g., "Hello!")

### Step 5: See the Message in the Output

1. Within 2-3 seconds, the message should appear in the **right panel (OUTPUT)**
2. The left panel will show the **message count**
3. You'll see the full message data in JSON format including:
   - Message text
   - Sender information
   - Chat ID
   - Timestamp
   - And more

## Features

### ✅ Real-time Message Polling
- The system polls Telegram API every 2 seconds
- New messages appear automatically

### ✅ Bot Verification
- Validates your bot token before connecting
- Shows bot username and name

### ✅ Live Status Indicators
- Green pulsing indicator when listening
- Message counter
- Real-time output display

### ✅ Start/Stop Control
- Start listening: Begin receiving messages
- Stop listening: Stop polling (saves resources)

## Troubleshooting

### Bot token is invalid
- Make sure you copied the entire token from BotFather
- Token should be in format: `number:letters`
- No spaces or extra characters

### Not receiving messages
1. Make sure you clicked **"Start Listening"**
2. Check that you're sending messages to the correct bot
3. Wait 2-3 seconds for messages to appear
4. Try clicking "Stop Listening" and then "Start Listening" again

### Messages appear delayed
- Messages are polled every 2 seconds
- There may be a slight delay (normal behavior)

## API Details

The integration uses:
- **Telegram Bot API** (https://api.telegram.org)
- **Long polling** method (getUpdates)
- **No webhook** required (perfect for local development)

## Next Steps

Once you can receive messages, you can:
- Add more Telegram nodes
- Process message content
- Send automated replies
- Build workflows based on messages
- Filter messages by chat or user

---

**Need help?** Check the Telegram Bot API documentation: https://core.telegram.org/bots/api

