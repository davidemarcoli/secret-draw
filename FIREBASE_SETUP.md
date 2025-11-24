# Firebase Setup Instructions

## 1. Enable Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Build** → **Authentication**
4. Click **Get Started**
5. Enable the following sign-in methods:
   - **Email/Password**: Click on it and toggle "Enable"
   - **Google**: Click on it, toggle "Enable", and provide a support email

## 2. Create Firestore Database

1. Go to **Build** → **Firestore Database**
2. Click **Create Database**
3. Choose a location (e.g., `eur3` for Europe or `us-central1` for US)
4. Start in **Production mode** (we'll add custom rules next)

## 3. Update Firestore Security Rules

1. In Firestore Database, go to the **Rules** tab
2. Copy the content from `firestore.rules` in your project
3. Paste it into the Firebase Console rules editor
4. Click **Publish**

The rules allow:
- Authenticated users to create events
- Anyone to read events (needed for public participant claiming)
- Only event creators to update their events
- Anyone to claim a participant spot

## 4. Get Your Firebase Configuration

1. Go to **Project Settings** (gear icon) → **General**
2. Scroll down to **Your apps**
3. If you haven't added a web app, click **Add app** → **Web**
4. Copy the `firebaseConfig` object values
5. Update your `.env.local` file with these values:

```env
FIREBASE_API_KEY="your-api-key"
FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
FIREBASE_APP_ID="your-app-id"
FIREBASE_MEASUREMENT_ID="G-..."
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 5. Test the Application

1. Restart your development server: `npm run dev`
2. Go to `/create`
3. Fill in the event form
4. Click "Login & Create Event"
5. Sign up with Google or Email/Password
6. The event should be created successfully!

## Security Notes

- Events can only be created by authenticated users
- Each event tracks who created it (`created_by` field)
- Only the creator can modify their events
- Participants can claim their spots without authentication (as intended)
- The admin link provides full access to event management
