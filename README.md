# Personal Management System

A comprehensive dashboard for personal productivity management built with Next.js, featuring task management, calendar, notes, finance tracking, and more.

## 🚀 Deployment Options

This application supports two storage modes:

### 1. Database Mode (MySQL/PostgreSQL)
For production environments with a database:
- Set `DATABASE_URL` or `MYSQL_URL` environment variable
- The app will automatically use Prisma with your database

### 2. IndexedDB Mode (Browser Storage)
For serverless deployments (like Vercel) without a database:
- No database configuration needed
- Data is stored locally in the browser using IndexedDB
- Perfect for personal use or demo purposes

## 📦 Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/dashboard-1)

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
cd dashboard-1

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

#### For Database Mode:
```env
DATABASE_URL="mysql://username:password@host:port/database"
```

#### For IndexedDB Mode:
```env
FORCE_INDEXEDDB=true
```

## 🗄️ Storage Configuration

The app automatically detects the storage mode:

- **Has `DATABASE_URL`** → Uses database with Prisma
- **No `DATABASE_URL`** → Uses IndexedDB in browser
- **`FORCE_INDEXEDDB=true`** → Forces IndexedDB mode

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
- **Database**: Prisma (MySQL/PostgreSQL) or IndexedDB
- **GraphQL**: Apollo Client/Server
- **Deployment**: Vercel-ready

## 📊 Data Storage

### Database Mode
- Full relational database support
- Data persistence across devices
- Multi-user support ready
- Backup and migration capabilities

### IndexedDB Mode
- Client-side storage
- No server requirements
- Perfect for personal use
- Data stays in your browser

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically with IndexedDB mode

### With Database

1. Set up your database (MySQL/PostgreSQL)
2. Add `DATABASE_URL` to Vercel environment variables
3. Deploy

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