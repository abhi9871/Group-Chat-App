# Group Chat App

A real-time group messaging application with media support, user authentication, and group administration features. Built with Node.js/Express backend, Socket.io for live messaging, and vanilla HTML/CSS/JavaScript frontend.

## Tech Stack

**Backend:**
- **Express.js** — HTTP server and REST API framework
- **Socket.io** — Real-time bidirectional communication
- **Sequelize** — ORM for MySQL database (models: User, Group, Chat, UserGroup, ArchivedChat)
- **JWT (jsonwebtoken)** — Authentication tokens with 1-hour expiration
- **bcrypt** — Password hashing with salt rounds 10
- **Multer** — File upload handling for media (images, videos, documents)
- **Cron** — Scheduled job to archive and purge chat history daily at midnight
- **dotenv** — Environment variable management

**Frontend:**
- **Vanilla JavaScript** — Event handling, API calls, WebSocket communication
- **Axios** — HTTP client for file uploads and API requests
- **Socket.io Client** — Real-time message reception
- **Bootstrap** — Responsive UI styling
- **Toastr** — Toast notifications for user feedback
- **HTML/CSS** — Basic structure and styling

## Architecture

The application follows a **client-server architecture** with a clear separation:

**Backend Structure (Express + Socket.io):**
- REST API (port 4000) handles authentication, group management, and file uploads
- Socket.io server (port 5000) manages real-time message streaming across clients
- Database layer with Sequelize ORM manages persistent data

**Frontend Structure (Vanilla JavaScript):**
- Single Page Application (SPA) served from Live Server (port 5500)
- Maintains JWT token in localStorage for authenticated requests
- Uses Socket.io for instant message reception; polls periodically for message history

**Data Flow:**
1. User signs up/logs in → receives JWT token stored locally
2. User creates/joins groups → group membership stored in UserGroup junction table
3. User sends text message → emitted via Socket.io → stored in Chat table → broadcast to all clients
4. User uploads media → Multer stores file in `/uploads` directory → stores file path in Chat table
5. Cron job runs daily at midnight → archives chats older than 1 day → deletes from active Chat table

### Folder Structure

```
Group-Chat-App/
├── Backend/
│   ├── app.js                          # Express server entry point, model associations, CORS setup
│   ├── package.json                    # Dependencies and scripts
│   ├── controllers/
│   │   ├── user.js                     # Sign up, login, list users
│   │   ├── group.js                    # Create groups, manage members, admin controls
│   │   └── chat.js                     # Media uploads, fetch messages, Socket.io setup
│   ├── routes/
│   │   ├── user.js                     # POST /user routes for auth
│   │   ├── group.js                    # GET/POST /group routes for group management
│   │   └── chat.js                     # POST/GET /chat routes for messaging
│   ├── models/
│   │   ├── user.js                     # User schema with email/phone validation
│   │   ├── group.js                    # Group schema
│   │   ├── chat.js                     # Active chat messages
│   │   ├── usergroup.js                # Junction table (hasMany, belongsToMany)
│   │   └── archivedchat.js             # Historical chat messages
│   ├── middleware/
│   │   ├── auth.js                     # JWT verification for protected routes
│   │   └── authSocket.js               # JWT verification for Socket.io connections
│   ├── cron/
│   │   └── cron.js                     # Daily midnight job to archive and delete old chats
│   └── utils/
│       └── database.js                 # Sequelize connection configuration
└── Frontend/
    ├── html/
    │   ├── login.html                  # Login form
    │   ├── signup.html                 # Registration form
    │   ├── home.html                   # Main chat interface
    │   └── password.html               # Password recovery page
    ├── js/
    │   ├── login.js                    # Login form submission
    │   ├── signup.js                   # Registration form submission
    │   ├── home.js                     # Main chat logic, Socket.io listeners
    │   ├── group.js                    # Group creation, member management UI
    │   ├── logout.js                   # Clear session and redirect
    │   └── password.js                 # Password reset logic
    ├── css/                            # Stylesheets
    └── images/                         # Assets (logos, icons)
```

## Key Features

- **User Authentication** — Sign up and login with JWT tokens; passwords hashed with bcrypt; 1-hour token expiration
- **Group Management** — Create groups, add/remove members, designate admins, view member list
- **Real-time Messaging** — Text messages sent via Socket.io instantly broadcast to all group members
- **Media Sharing** — Upload and send images, videos, and documents; files stored on server and linked in chat
- **Message History** — Fetch historical messages on demand; stored in database with user and group references
- **Admin Controls** — Group creators are admins by default; admins can promote other members and manage roster
- **Chat Archival** — Automatic nightly cron job archives chats older than 1 day to a separate table, then purges
- **Responsive UI** — Bootstrap grid for mobile and desktop viewing; inline media rendering in chat

## Setup Instructions

### Prerequisites
- **Node.js** (v14+) and npm
- **MySQL** server running
- Environment variables configured (see below)

### Backend Setup

1. **Navigate to the Backend directory:**
   ```bash
   cd Backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create a `.env` file in the Backend directory:**
   ```
   PORT=4000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=group_chat_app
   TOKEN_SECRET_KEY=your_secret_key
   ```

4. **Ensure MySQL database exists:**
   ```bash
   mysql -u root -p
   CREATE DATABASE group_chat_app;
   ```

5. **Start the server:**
   ```bash
   npm start
   ```
   Server will run on `http://localhost:4000` and Socket.io on `http://localhost:5000`

### Frontend Setup

1. **Open the Frontend directory in VS Code:**
   ```bash
   code Frontend/
   ```

2. **Install and run Live Server extension** (or use any local server on port 5500):
   - Right-click `Frontend/html/login.html` → "Open with Live Server"

3. **Access the app:**
   - Navigate to `http://127.0.0.1:5500/html/login.html` in your browser

## What I'd Improve Next

1. **Socket.io Room Management** — Currently, Socket.io broadcasts to all connected clients via `io.emit()`. This should be refactored to use rooms (one per group) so messages only go to group members: `socket.join(`group_${groupId}`)` and `io.to(`group_${groupId}`).emit('newMessage', msg)`. This prevents message leakage across unrelated groups.

2. **Message Pagination with Infinite Scroll** — The frontend currently fetches all messages on each poll, and stores them in localStorage. This will cause performance degradation and memory bloat for active groups. Implement cursor-based pagination (`LIMIT` + `OFFSET` in the Chat query) and lazy-load older messages as the user scrolls up; limit frontend storage to the last N messages.

3. **Input Validation & SQL Injection Prevention** — Some controller endpoints accept query/body parameters directly in SQL queries or pass them unsanitized into Sequelize raw queries (e.g., when fetching group participants). Use parameterized queries or Sequelize's built-in escaping throughout; add server-side validation for all inputs (phone format, email format, message length limits, file size/type limits for media).
