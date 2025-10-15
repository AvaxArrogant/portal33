# Aviva Insurance Portal

A modern insurance management portal built with Next.js 14, TypeScript, and Supabase.

## 🚀 Features

- **User Management**: Admin, Sub-admin, and Customer roles
- **Policy Management**: Create, view, and manage insurance policies
- **Auto Insurance**: Comprehensive vehicle insurance policies
- **Dashboard**: Real-time analytics and revenue tracking
- **PDF Generation**: Automated policy certificate generation
- **Secure Authentication**: Supabase-based authentication system
- **Responsive Design**: Mobile-first design with Tailwind CSS

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Git

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:AvaxArrogant/portal33.git
   cd portal33
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory (see `.env.local.example`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Set up the database**
   
   Run the schema in your Supabase dashboard:
   ```bash
   # Use the SQL from supabase_schema.sql in your Supabase SQL Editor
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Build for Production

```bash
npm run build
npm start
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy!

### Netlify

1. Push your code to GitHub
2. Import your repository in [Netlify](https://netlify.com)
3. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Base directory**: `/` (leave empty or root)
4. Add environment variables in Netlify project settings
5. Deploy!

### Manual Deployment

The `netlify.toml` and `vercel.json` files are pre-configured for easy deployment.

## 📁 Project Structure

```
├── app/                    # Next.js 14 App Router
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   ├── dashboard/         # User dashboard
│   ├── policies/          # Policy management
│   └── ...
├── components/            # React components
├── lib/                   # Utility functions and configurations
│   ├── supabase/         # Supabase client configuration
│   ├── auth.ts           # Authentication utilities
│   └── types.ts          # TypeScript type definitions
├── public/               # Static assets
├── scripts/              # Database and utility scripts
└── types/                # TypeScript type declarations
```

## 🔐 Environment Variables

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)

## 🗄️ Database Setup

1. Create a new Supabase project
2. Run the SQL schema from `supabase_schema.sql`
3. Run scripts in `scripts/` folder for additional setup:
   - `create-default-admin.mjs` - Create default admin user
   - `sync-users-profiles.mjs` - Sync users with profiles

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **PDF Generation**: pdf-lib
- **Deployment**: Vercel/Netlify

## 📄 License

This project is proprietary and confidential.

## 🤝 Support

For support, please contact the development team.

## 🔧 Troubleshooting

### Build Errors

If you encounter build errors:

1. **Clear cache and rebuild**
   ```bash
   rm -rf .next
   npm run build
   ```

2. **Check environment variables**
   - Ensure all required environment variables are set
   - Verify Supabase credentials are correct

3. **Node version**
   - Ensure you're using Node.js 18 or higher
   ```bash
   node --version
   ```

### Deployment Issues

If deployment fails with "Base directory does not exist" error:

1. **For Netlify**: Ensure `netlify.toml` is in the root directory
2. **For Vercel**: Ensure `vercel.json` is in the root directory
3. **Set base directory to `/` or leave empty** in deployment settings

### Database Connection Issues

1. Check Supabase credentials in `.env.local`
2. Verify Supabase project is active
3. Check database schema is properly set up

---

Built with ❤️ for Aviva Insurance
