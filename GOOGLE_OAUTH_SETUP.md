# Google OAuth Setup Guide

## Backend Environment Variables

Add these to your backend `.env` file:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_REDIRECT_URI=https://your-domain.com/auth/google/callback

# Existing variables
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
MONGODB_URI=your_mongodb_uri
```

## Frontend Environment Variables

Create a `.env` file in your frontend root directory:

```env
# Google OAuth Configuration
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here

# Backend URL
REACT_APP_BACKEND_URL=https://geosolver-backend-production.up.railway.app
```

## Google Cloud Console Setup

1. **Enable APIs:**
   - Go to "APIs & Services" → "Library"
   - Enable "Google+ API" (if available)
   - Enable "Google Identity and Access Management (IAM) API"

2. **Create OAuth 2.0 Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: "Web application"
   - Authorized redirect URIs:
     - `http://localhost:3000` (development)
     - `https://your-production-domain.com` (production)

3. **Copy Client ID:**
   - Copy the generated Client ID
   - Replace `your_google_client_id_here` in both .env files

## Installation

1. **Backend:**
   ```bash
   cd geosolver-backend
   npm install
   ```

2. **Frontend:**
   ```bash
   npm install
   ```

## Testing

1. Start both backend and frontend
2. Go to the login page
3. Click "Вход с Google" button
4. Complete Google OAuth flow
5. You should be redirected to your account page

## Troubleshooting

- Make sure Google OAuth script is loaded (check browser console)
- Verify Client ID is correct in both .env files
- Check that redirect URIs match your domain
- Ensure backend is running and accessible
