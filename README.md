# Ad Generator UI

A modern React frontend for the AI-powered ad generation system. Features a chat-like interface with session management and real-time artifacts display.

## Features

- **Modern Chat Interface**: Clean, intuitive chat experience similar to modern AI assistants
- **Session Management**: Maintains conversation context across messages 
- **Artifacts Panel**: Displays generated content (prompts, posts, compliance checks, images) in the right sidebar
- **Multi-Agent Support**: Visual indicators showing which AI agent handled each response
- **Markdown Support**: Rich text rendering with syntax highlighting
- **Responsive Design**: Built with Tailwind CSS for a modern, mobile-friendly UI

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Markdown** for rich text rendering
- **Axios** for API communication
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- The backend API server running on `http://localhost:8004`

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The app will be available at `http://localhost:3000`

### Building for Production

```bash
pnpm build
```

## Project Structure

```
src/
├── components/          # React components
│   ├── ArtifactsPanel.tsx    # Right sidebar for generated content
│   ├── ChatInput.tsx         # Message input component
│   ├── ChatInterface.tsx     # Main chat area
│   ├── ChatMessage.tsx       # Individual message component
│   └── Sidebar.tsx           # Left sidebar with conversations
├── context/             # React context for state management
│   └── ChatContext.tsx       # Global chat state
├── services/            # API services
│   └── api.ts               # Backend API integration
├── types/               # TypeScript type definitions
│   └── chat.ts              # Chat-related types
└── App.tsx             # Main application component
```

## Usage

### Starting a New Conversation

1. Click "New Conversation" in the sidebar
2. Type your message in the input field
3. The system will automatically:
   - Create a new session on first message
   - Route to appropriate AI agent based on content
   - Display generated artifacts in the right panel

### Session Management

- **First Message**: No session ID sent to backend
- **Subsequent Messages**: Uses session ID returned from first response
- **Context Awareness**: Each message includes full conversation history
- **Agent Selection**: System intelligently chooses the right agent (brainstormer, post generator, compliance checker, image generator)

### Artifacts

Generated content automatically appears in the right panel:

- **🟣 Enhanced Prompts**: From the brainstormer agent
- **🔵 Ad Content**: From the post generator agent  
- **🟢 Compliance Checks**: From the compliance agent
- **🟠 Image Prompts**: From the image generator agent

## API Integration

The frontend communicates with the FastAPI backend at `http://localhost:8004/ad-generator/`:

- `POST /chat` - Send chat messages with session context
- `GET /session/{session_id}` - Get session context and history  
- `GET /sessions/{user_id}` - Get user's conversation history
- `GET /health` - Health check

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint

### Configuration

- **API Base URL**: Configured in `src/services/api.ts`
- **Styling**: Tailwind config in `tailwind.config.js`
- **Development Server**: Vite config in `vite.config.ts`

## Contributing

1. Follow the existing code structure and TypeScript patterns
2. Add new components to the `components/` directory
3. Update types in `types/` when adding new data structures
4. Use Tailwind CSS classes for styling
5. Test with the backend API running on port 8004