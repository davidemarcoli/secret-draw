# 🎁 Secret Draw

> **Built with Vibe and Code** - AI-powered development

The easiest way to organize your Secret Santa or Wichteln gift exchange. Free, open-source, and privacy-focused.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://secret-draw.com)


## ✨ Features

- 🎯 **Simple & Fast** - Create events in seconds
- 🔒 **Privacy First** - No registration or emails required
- 🎨 **Beautiful UI** - Modern, responsive design with dark mode
- 🔗 **Share via Link** - Just send one link to all participants
- 🚫 **Exclusion Rules** - Prevent specific pairings (e.g., couples)
- 📱 **Mobile Friendly** - Works perfectly on all devices
- 🌍 **Multi-language** - Supports Secret Santa (EN) and Wichteln (DE)
- 🔐 **Secure** - Firebase authentication for event creators
- 📊 **Admin Dashboard** - Track who has claimed their spot

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/davidemarcoli/secret-draw.git
   cd secret-draw
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Firestore Database
   - Enable Authentication (Google & Email/Password)
   - Copy your Firebase config to `.env.local`:
   
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
   NEXT_PUBLIC_FIREBASE_MEASUREMENT="G-..."
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Update Firestore Rules**
   - Copy the rules from `firestore.rules`
   - Paste them in Firebase Console → Firestore Database → Rules
   - Click "Publish"

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Authentication**: [Firebase Auth](https://firebase.google.com/docs/auth)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Deployment**: [Vercel](https://vercel.com)

## 📖 How It Works

1. **Create Event**: Organizer creates an event with participant names
2. **Set Exclusions**: Optionally prevent specific pairings
3. **Share Link**: Send the public link to all participants
4. **Claim Names**: Each participant claims their name
5. **Reveal Draw**: See who they're buying a gift for! 🎉

## 🤝 Contributors

<a href="https://github.com/davidemarcoli/secret-draw/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=davidemarcoli/secret-draw" />
</a>



- **[Davide Marcoli](https://github.com/davidemarcoli)** - [@davidemarcoli](https://davidemarcoli.dev)
- **[Stefan Laux](https://github.com/stefanlaux)** - [@stefanlaux](https://stefan-laux.dev)

## 🙏 Acknowledgments

- Built with ❤️ using [Vibecode](https://vibecode.app)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

## 🐛 Found a Bug?

If you find a bug or have a feature request, please [open an issue](https://github.com/davidemarcoli/secret-draw/issues).

## ⭐ Show Your Support

Give a ⭐️ if this project helped you organize your Secret Santa!

---
