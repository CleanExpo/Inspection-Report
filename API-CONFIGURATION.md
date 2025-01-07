# API Configuration Guide

## Overview
This document outlines the steps required to configure API credentials and endpoints for the application.

## Setup Instructions

1. Create a Firebase Project:
   - Go to the [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or select an existing one
   - Enable Authentication and Firestore services

2. Get Firebase Configuration:
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click the web icon (</>)
   - Register your app and copy the configuration

3. Get Firebase Admin SDK Configuration:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file securely

4. Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```

5. Update the `.env` file with your Firebase configurations:
   ```env
   # Firebase Client Configuration
   FIREBASE_API_KEY=your_web_api_key
   FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   FIREBASE_APP_ID=your_app_id

   # Firebase Admin Configuration
   FIREBASE_ADMIN_PROJECT_ID=your_project_id
   FIREBASE_CLIENT_EMAIL=from_service_account_json
   FIREBASE_PRIVATE_KEY=from_service_account_json

   # Other API Configurations
   API_KEY=your_api_key
   API_ENDPOINT=your_endpoint
   ```

6. Install dependencies and start the development server:
   ```bash
   npm install
   npm run dev
   ```

## Infrastructure Components

### Identity Management
- Firebase Authentication for user management and authentication
- Role-based access control using Firebase Custom Claims
- Secure token management with Firebase Admin SDK

### Monitoring and Analytics
- Google Cloud Monitoring for API usage tracking
- Google Cloud Logging for application logs
- Custom metrics using Cloud Monitoring API

### Data Storage
- Cloud Firestore for user data and configurations
- Cloud Storage for file uploads and media
- Cloud Key Management Service (KMS) for sensitive data

## Authentication and Authorization

### User Roles
The application supports two main roles:
- **Admin**: Full access to API management and system configuration
- **Buyer**: Access to their own dashboard and API configurations

### Setting Up User Roles
1. Create a user through Firebase Authentication
2. Set custom claims for role-based access:
   ```javascript
   await admin.auth().setCustomUserClaims(uid, { role: 'admin' });
   // or
   await admin.auth().setCustomUserClaims(uid, { role: 'buyer' });
   ```

### API Access Control
- All API endpoints are protected by Firebase Authentication
- Users must include a valid Firebase ID token in requests:
  ```http
  Authorization: Bearer <firebase_id_token>
  ```

## Usage Tracking

### Monitoring API Usage
- API calls are tracked in Firestore
- Usage data is stored per user
- Quotas and rate limits are enforced through Cloud Functions

### Rate Limiting
- Default limits are configured in `.env`:
  ```env
  RATE_LIMIT_REQUESTS=100
  RATE_LIMIT_WINDOW_MS=900000 # 15 minutes
  ```

### Rate Limiting and Usage Tracking
- Implemented using Google Cloud Monitoring custom metrics
- Usage quotas managed through Firebase Remote Config
- Rate limiting handled by Cloud Armor

## Security Notes
- Never commit the `.env` file to version control
- Keep your API keys and secrets secure
- Use Google Cloud KMS for managing sensitive credentials
- Rotate credentials periodically according to your security policies
- Enable audit logging in Google Cloud Console

## Development Tools
- Firebase Emulator Suite for local development
- Google Cloud SDK for deployment and management
- Firebase Admin SDK for backend operations
