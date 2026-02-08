# Expense Calculator

A modern, responsive web app to track monthly salary, savings, and expenses over a 12-month period. Built with Next.js and designed as a Progressive Web App (PWA) for installation on any device.

## Features

- **Two 6-Month Periods** - Track expenses across Feb-Jul and Aug-Jan 
- **Savings Tracking** - Monitor long-term and short-term  monthly savings targets
- **Goal Fund** - Save towards a ¥300,000 goal for smartphone, travel, and moving expenses
- **Auto Carryover** - Surplus from one month automatically carries to the next
- **Visual Charts** - Bar charts showing monthly savings breakdown
- **Dark Mode** - Toggle between light and dark themes
- **CSV Export** - Download all data as a spreadsheet
- **Cloud Sync** - Optional Supabase database for cross-device sync
- **Offline Support** - Works without internet after first load
- **PWA** - Install as an app on Mac, Windows, Android, or iOS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Database**: Supabase (PostgreSQL) - optional
- **Storage**: localStorage (fallback)
- **PWA**: next-pwa

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/expense-app.git
cd expense-app

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file for Supabase (optional):

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Without Supabase, the app stores data in localStorage.

## Database Setup (Optional)

To enable cloud sync with Supabase:

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Run the SQL from `supabase-schema.sql` in the SQL Editor
4. Copy your project URL and anon key to `.env.local`

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Add environment variables (if using Supabase)
4. Deploy

### Other Platforms

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Install as App

### Desktop (Chrome/Edge)
1. Open the deployed URL
2. Click the install icon in the address bar
3. The app appears in your Applications folder

### Android
1. Open in Chrome
2. Tap menu → "Add to Home Screen" or "Install app"

### iOS
1. Open in Safari
2. Tap Share → "Add to Home Screen"

## Project Structure

```
src/
├── app/
│   ├── layout.tsx      # Root layout with PWA meta tags
│   ├── page.tsx        # Main page with tabs
│   └── globals.css     # Tailwind styles
├── components/
│   ├── Header.tsx      # App header with save/export buttons
│   ├── MonthCard.tsx   # Individual month expense card
│   ├── GoalsPanel.tsx  # 3 lakh goal tracker
│   ├── SavingsChart.tsx # Bar chart visualization
│   └── ...
├── hooks/
│   ├── useExpenseData.ts  # Data management (localStorage + Supabase)
│   └── useLocalStorage.ts # localStorage hook
├── lib/
│   └── supabase.ts     # Supabase client
├── types/
│   └── index.ts        # TypeScript interfaces
└── utils/
    └── calculations.ts # Salary/savings calculations
```

## Usage

1. **View Months** - Switch between "First 6 Months" and "Next 6 Months" tabs
2. **Edit Data** - Click on any month card to expand and edit values
3. **Track Goals** - Go to "Goals" tab to allocate money towards your ¥300,000 target
4. **Save** - Click the Save button to persist your changes
5. **Export** - Download your data as CSV for backup


