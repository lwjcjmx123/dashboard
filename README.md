# Personal Management System

A comprehensive dashboard for personal productivity management built with Next.js, featuring task management, calendar, notes, finance tracking, and more.

## 🚀 Deployment Options

This application uses IndexedDB for client-side data storage:

### IndexedDB Mode (Browser Storage)

- No database configuration needed
- Data is stored locally in the browser using IndexedDB
- Perfect for personal use and serverless deployments
- Works seamlessly with Vercel, Netlify, and other static hosting platforms

## 📦 Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/dashboard)

1. Click the deploy button above
2. No environment variables needed for IndexedDB mode
3. Your app will be ready in minutes!

## 🛠️ Local Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Configuration

No environment configuration is required for basic usage. The app automatically uses IndexedDB for data storage.

Optionally, you can create `.env.local` for development:

```bash
cp .env.example .env.local
```

```env
# Optional: Force IndexedDB mode (enabled by default)
FORCE_INDEXEDDB=true
```

## 🗄️ Data Storage

The app uses IndexedDB for client-side data storage:

- **Automatic Setup** → No configuration required
- **Browser Storage** → Data persists in your browser
- **Privacy Focused** → Your data stays on your device

## 📱 Features

- **Task Management**: Create, organize, and track tasks with priorities
- **Calendar**: Schedule and manage events
- **Notes**: Rich text note-taking with tags
- **Finance**: Track expenses and bills
- **Pomodoro Timer**: Built-in productivity timer
- **Analytics**: Visual insights into your productivity
- **Settings**: Customizable themes and preferences

## 🔧 Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Storage**: IndexedDB (Browser Storage)
- **GraphQL**: Apollo Client/Server
- **Deployment**: Vercel-ready

## 📊 Data Storage

### IndexedDB Storage

- Client-side storage in your browser
- No server or database requirements
- Perfect for personal productivity management
- Data privacy - everything stays on your device
- Export/import functionality for data backup

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically with IndexedDB mode

### Configuration

1. No additional setup required
2. Deploy directly from GitHub
3. Data automatically stored in browser

### Other Platforms

The app works on any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
