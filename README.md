# DevCollab Backend

A robust backend API for a developer collaboration platform that enables real-time code sharing, collaborative editing, and interactive learning experiences.

## Features

- **Real-time Collaborative Editing**: Multiple developers can edit code simultaneously using Socket.IO
- **Code Execution**: Execute code in multiple programming languages
- **Authentication**: Support for local, GitHub, and Google OAuth authentication
- **GraphQL API**: Flexible data querying with Apollo Server
- **Real-time Chat**: Project-based chat functionality
- **File Upload**: Cloudinary integration for file management
- **Rate Limiting**: API protection against abuse
- **Security**: Helmet.js, CORS, and JWT-based authentication

## Tech Stack

- **Runtime**: Node.js (>=20.11.1)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.IO
- **API**: GraphQL with Apollo Server
- **Authentication**: Passport.js (Local, GitHub, Google)
- **File Storage**: Cloudinary
- **Security**: Helmet, bcrypt, JWT
- **Development**: Nodemon, ESLint

## Project Structure

```
src/
├── Auth/              # Authentication strategies
├── Config/            # Database and service configurations
├── Controllers/       # Request handlers
├── Graphql/          # GraphQL schema and resolvers
├── Middleware/       # Custom middleware
├── Models/           # Database models
├── Routes/           # REST API routes
├── Utils/            # Utility functions
```

## Prerequisites

- Node.js (version 20.11.1 or higher)
- MongoDB database
- Cloudinary account (for file uploads)
- GitHub OAuth App (optional)
- Google OAuth credentials (optional)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bikashd003/DevCollab-Backend.git
   cd DevCollab-Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory with the following variables:
   
   ```env
   # Server Configuration
   PORT=5000
   CLIENT_URL=http://localhost:3000
   NODE_ENV=development
   
   # Database
   MONGO_URL=your_mongodb_connection_string
   
   # Authentication
   JWT_SECRET=your_jwt_secret_key
   SESSION_SECRET=your_session_secret
   
   # GitHub OAuth (Optional)
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   GITHUB_CALLBACK_URL=http://localhost:5000/auth/github/callback
   
   # Google OAuth (Optional)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/callback/google
   
   # Cloudinary (For file uploads)
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

## Usage

### Development Mode
```bash
npm run dev
```
This starts the server with nodemon for automatic restarts on file changes.

### Production Mode
```bash
npm start
```

### Other Scripts
```bash
# Run tests
npm test

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## API Endpoints

### GraphQL
- **Endpoint**: `http://localhost:5000/graphql`
- **Playground**: Available in development mode

### REST API
- **Code Execution**: `/api/execute` - Execute code in various languages

### Authentication
- **Local**: `/auth/login`, `/auth/register`
- **GitHub**: `/auth/github`
- **Google**: `/auth/google`

## Socket.IO Events

### Client to Server
- `joinProject` - Join a collaborative project room
- `codeChange` - Broadcast code changes
- `languageChanged` - Change programming language
- `chatMessage` - Send chat messages
- `typing` / `stopTyping` - Typing indicators

### Server to Client
- `connectedUsers` - List of users in the project
- `codeChange` - Receive code updates
- `chatHistory` - Project chat history
- `userJoined` / `userLeft` - User presence updates

## Features in Detail

### Real-time Collaboration
The platform supports multiple users editing the same code file simultaneously with:
- Live cursor tracking
- Real-time code synchronization
- User presence indicators
- Collaborative chat

### Code Execution
Execute code in multiple programming languages with:
- Syntax highlighting
- Error handling
- Execution time tracking
- Output capture

### Authentication System
Flexible authentication supporting:
- Email/password registration
- GitHub OAuth integration
- Google OAuth integration
- JWT-based session management

## Development

### Code Style
The project uses ESLint for code linting. Run `npm run lint` to check for issues.

### Database Models
- **Users**: User profiles and authentication
- **Editor**: Collaborative code projects
- **Blogs**: Platform blog posts
- **Questions**: Q&A functionality

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Bikash Das**

## Support

For support and questions, please open an issue in the GitHub repository.