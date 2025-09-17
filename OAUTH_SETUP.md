# OAuth Setup Guide

This guide explains how to set up OAuth authentication for GitHub and Google in the DevCollab application.

## Environment Variables

Make sure the following environment variables are set in your `.env` file:

```env
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/auth/github/callback

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback

# Other required variables
CLIENT_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
```

## GitHub OAuth Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in the application details:
   - Application name: DevCollab
   - Homepage URL: http://localhost:3000
   - Authorization callback URL: http://localhost:5000/auth/github/callback
4. Copy the Client ID and Client Secret to your `.env` file

## Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
5. Configure the OAuth consent screen
6. Set up the OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized JavaScript origins: http://localhost:3000
   - Authorized redirect URIs: http://localhost:5000/auth/google/callback
7. Copy the Client ID and Client Secret to your `.env` file

## API Endpoints

### GitHub OAuth
- `GET /auth/github/url` - Get GitHub authorization URL
- `GET /auth/github/callback` - GitHub OAuth callback

### Google OAuth
- `GET /auth/google/url` - Get Google authorization URL
- `GET /auth/google/callback` - Google OAuth callback

## Frontend Integration

The frontend automatically handles OAuth authentication through:
1. OAuth buttons in the authentication modal
2. Global OAuth handler component that processes callback URLs
3. Automatic token management and user session setup

## User Model

The User model supports OAuth authentication with the following fields:
- `githubId` - GitHub user ID
- `googleId` - Google user ID
- `email` - User email (shared across all auth methods)
- `username` - User display name
- `profilePicture` - Profile picture URL from OAuth provider

## Security Features

- JWT tokens for session management
- Secure HTTP-only cookies
- CSRF protection through state parameters
- Account linking for existing users with same email
- Automatic profile picture and user data sync