# Life In The UK Test Practice

A modern, multilingual Life in the UK test practice platform built with Next.js 16, featuring comprehensive admin tools, revision modes, and payment integration.

## 🚀 Features

### User Features
- **📚 Revision Modes**
  - Practice mode with instant feedback
  - Mock test simulation with timed sessions
  - Progress tracking and performance analytics
  - Question bookmarking and review

- **🌍 Internationalization**
  - Multi-language support (English, Amharic, etc.)
  - Locale-based routing with `next-intl`
  - RTL support for applicable languages

- **💳 Payment Integration**
  - Stripe integration for premium features
  - Subscription management
  - Secure payment processing

- **📱 Progressive Web App (PWA)**
  - Offline support
  - Install as native app
  - Push notifications ready

- **🎨 Modern UI/UX**
  - Dark/light theme support
  - Responsive design
  - Smooth animations with Framer Motion
  - Custom-designed components with Radix UI

### Admin Features
- **👥 User Management**
  - Role-based access control (Admin, Moderator, User)
  - User status management
  - Email verification tracking

- **🌐 Content Management**
  - Countries & jurisdictions management
  - Licence categories configuration
  - Question bank administration
  - Category-based question organization

- **📊 Analytics Dashboard**
  - User statistics with Recharts
  - Performance metrics
  - Revenue tracking

## 🛠️ Tech Stack

- **Framework:** Next.js 16.1.6 (App Router)
- **React:** 19.2.3
- **TypeScript:** 5.x
- **Styling:** Tailwind CSS 4.x
- **State Management:** Zustand 5.x
- **UI Components:** Radix UI
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **HTTP Client:** Axios
- **Payment:** Stripe
- **PWA:** @ducanh2912/next-pwa
- **Rich Text:** Quill
- **Charts:** Recharts

## 📋 Prerequisites

- Node.js 20.x or higher
- npm, yarn, pnpm, or bun
- Git

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd life-in-the-uk
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=your_api_url

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
life-in-the-uk/
├── app/
│   ├── [locale]/              # Internationalized routes
│   │   ├── backoffice/        # Admin panel
│   │   │   ├── countries/
│   │   │   ├── jurisdictions/
│   │   │   ├── licence-categories/
│   │   │   ├── users/
│   │   │   └── ...
│   │   ├── revision/          # User revision modes
│   │   │   ├── practice/
│   │   │   └── mock-test/
│   │   └── ...
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── auth/                  # Authentication components
│   ├── charts/                # Analytics charts
│   ├── layout/                # Layout components
│   ├── revision/              # Revision mode components
│   └── ui/                    # Reusable UI components
├── lib/
│   ├── store/                 # Zustand stores
│   ├── types/                 # TypeScript types
│   └── utils/                 # Utility functions
├── messages/                  # i18n translation files
├── public/                    # Static assets
└── middleware.ts              # Next.js middleware
```

## 🎯 Key Routes

### Public Routes
- `/[locale]` - Home page
- `/[locale]/revision/practice` - Practice mode
- `/[locale]/revision/mock-test` - Mock test mode

### Admin Routes (Protected)
- `/[locale]/backoffice` - Admin dashboard
- `/[locale]/backoffice/users` - User management
- `/[locale]/backoffice/countries` - Country management
- `/[locale]/backoffice/jurisdictions` - Jurisdiction management
- `/[locale]/backoffice/licence-categories` - Category management

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## 🌐 Internationalization

The platform supports multiple languages using `next-intl`. Translation files are located in the `messages/` directory.

To add a new language:
1. Create a new JSON file in `messages/` (e.g., `messages/fr.json`)
2. Add translations following the existing structure
3. Update the locale configuration in `middleware.ts`

## 🎨 Theming

The application supports dark and light themes using `next-themes`. Theme preferences are persisted in localStorage.

## 📱 PWA Configuration

The app is configured as a Progressive Web App with:
- Offline support
- App manifest (`public/manifest.json`)
- Service worker for caching
- Install prompts

## 🔐 Authentication & Authorization

- Role-based access control (RBAC)
- Protected routes with middleware
- Admin-only backoffice access
- User status verification - active, inactive, suspended

## 💾 State Management

Global state is managed using Zustand with the following stores:
- `admin-store` - Admin panel data and operations
- Additional stores for user sessions, preferences, etc.

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Other Platforms

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm run start
   ```

## 📚 Documentation

Additional documentation is available in the `docs/` directory:
- `I18N_IMPLEMENTATION.md` - Internationalization guide
- `RADIX_DIALOG_MIGRATION.md` - Dialog component migration
- `STRIPE_INTEGRATION.md` - Payment integration guide
- `SETUP_ASSETS.md` - Asset setup instructions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For support and questions, please contact the development team.

---

Built with ❤️ using Next.js and modern web technologies
