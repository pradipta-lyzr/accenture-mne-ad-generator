# Quick Start Guide

## Running the Ad Generator Application

### 1. Start the Backend API Server

First, make sure the FastAPI backend is running:

```bash
# From the main project directory
cd /home/laiser/projects/accenture-highlights-agent
uvicorn app.main:app --host 0.0.0.0 --port 8004 --reload
```

The backend should be available at `http://localhost:8004`

**Note**: The backend now includes CORS middleware to allow requests from the React frontend running on localhost:3000.

### 2. Start the Frontend React App

In a new terminal, start the React development server:

```bash
# Navigate to the UI directory
cd /home/laiser/projects/accenture-highlights-agent/ad-generator-ui

# Start the development server
pnpm dev
```

The frontend will be available at `http://localhost:3000`

### 3. Using the Application

1. **Start a New Conversation**: Click "New Conversation" in the left sidebar
2. **Send Messages**: Type your message and press Enter to send
3. **Final Toggle**: Check "Generate image (final version)" to enable image generation with your message
4. **View Artifacts**: Generated content (prompts, posts, compliance checks, images) will appear in the right panel
5. **Session Management**: The app automatically manages session context:
   - All messages: Always use `/ad-generator/generate` endpoint with `initial_prompt`
   - Session context: Backend builds previous context and passes it to every agent
   - Full pipeline: Every message goes through brainstormer → post generator → compliance → image (if final=true)

### Features

- **Final Toggle**: Enable image generation by checking the "Generate image (final version)" checkbox
- **Smart Display Logic**: 
  - **Chat Area**: Shows only the generated ad content and images (when available)
  - **Artifacts Panel**: Shows all intermediate steps (enhanced prompts, compliance checks, image prompts, etc.)
- **Multi-Agent Support**: Different agents handle different types of requests:
  - 🟣 **Brainstormer**: Enhances and improves prompts
  - 🔵 **Post Generator**: Creates ad content and marketing copy
  - 🟢 **Compliance Checker**: Reviews content for policy compliance
  - 🟠 **Image Generator**: Creates image descriptions and DALL-E images
- **Session Management**: Seamless conversation flow with proper endpoint routing

### Example Conversations

Try these sample messages to see different features in action:

1. **"Create an ad for eco-friendly water bottles"** (without final toggle) → Initial ad generation
2. **"Create an ad for eco-friendly water bottles"** (with final toggle checked) → Full pipeline including image generation
3. **"Make it more creative"** → Follow-up refinement using chat endpoint
4. **"Check compliance for this content"** → Compliance review

### API Payload Examples

**First Message (Generate endpoint) - Basic:**
```json
{
  "initial_prompt": "Create an ad for coca cola with a very relevant joke",
  "feedback": "",
  "user_id": "default_user"
}
```

**First Message (Generate endpoint) - With Image Generation:**
```json
{
  "initial_prompt": "Create an ad for coca cola with a very relevant joke",
  "feedback": "",
  "final": true,
  "user_id": "default_user"
}
```

**Subsequent Messages (Generate endpoint with context):**
```json
{
  "initial_prompt": "Make it more creative",
  "session_id": "session_123456789",
  "user_id": "default_user",
  "feedback": ""
}
```

### Backend Processing

- **Unified Pipeline**: All messages go through the complete 5-step pipeline:
  1. **Context Building**: Previous session context is built and passed to every agent
  2. **Brainstormer**: Enhances the prompt with full conversation context
  3. **Post Generator**: Creates ad content using enhanced prompt and context
  4. **Compliance Check**: Reviews content with full context awareness
  5. **Image Generation**: (if final=true) Creates image prompt and DALL-E image

- **Chat Endpoint**: DEPRECATED - redirects to generate endpoint
- **Context Awareness**: Every agent receives previous conversation history and session state

### Display Logic

- **Chat Area**: Only shows the final generated ad content and images (clean, focused view)
- **Artifacts Panel**: Shows all processing steps including:
  - Enhanced prompts from brainstormer
  - Generated ad content 
  - Compliance check results
  - Image generation prompts
  - Generated images with URLs

### Troubleshooting

- **Backend not responding**: Ensure the FastAPI server is running on port 8004
- **Styles not loading**: Run `pnpm build` to ensure Tailwind CSS is properly configured
- **API errors**: Check the browser console and backend logs for detailed error messages