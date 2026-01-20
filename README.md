# PocketLedger - Personal Expense Tracker

A privacy-first, token-based expense tracking application built for personal use. PocketLedger provides a secure and intuitive way to manage your finances without the complexity of traditional budgeting apps.

## ✨ Features

- **🔐 Token-Based Authentication**: No passwords to remember. Secure 64-character token authentication with HttpOnly cookies.
- **📊 Custom Expense Sections**: Create personalized categories (e.g., "People I Owe", "Groceries", "Entertainment") with custom budgets and themes.
- **💰 Smart Bill Tracking**: Add expenses with emoji tags, descriptions, and built-in calculator.
- **📈 Visual Analytics**: Interactive pie charts, spending trends, and budget progress indicators.
- **📅 Calendar Integration**: View expenses by date with calendar picker and daily summaries.
- **🌓 Dark/Light Mode**: Full theme support with system preference detection.
- **📱 Fully Responsive**: Optimized for mobile, tablet, and desktop.

## 🚀 Tech Stack

**Frontend:**
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui components
- Framer Motion for animations
- Chart.js for data visualization

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT-style token authentication
- Rate limiting & security middleware

## 📁 Project Structure
pocketledger/
├── backend/
│ ├── src/
│ │ ├── config/
│ │ │ ├── database.js
│ │ │ └── rateLimit.js
│ │ ├── controllers/
│ │ │ ├── auth.controller.js
│ │ │ ├── section.controller.js
│ │ │ └── bill.controller.js
│ │ ├── models/
│ │ │ ├── User.js
│ │ │ ├── Section.js
│ │ │ └── Bill.js
│ │ ├── routes/
│ │ │ ├── auth.routes.js
│ │ │ ├── section.routes.js
│ │ │ └── bill.routes.js
│ │ ├── middleware/
│ │ │ ├── auth.js
│ │ │ └── validate.js
│ │ ├── utils/
│ │ │ ├── userUtils.js
│ │ │ └── generateToken.js
│ │ └── index.js
│ ├── package.json
│ └── server.js
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ │ ├── ui/ # Shadcn components
│ │ │ ├── layout/
│ │ │ │ ├── Navbar.tsx
│ │ │ │ ├── Footer.tsx
│ │ │ │ └── Layout.tsx
│ │ │ ├── auth/
│ │ │ │ ├── LoginModal.tsx
│ │ │ │ ├── RegisterModal.tsx
│ │ │ │ └── ProfileSetupModal.tsx
│ │ │ ├── dashboard/
│ │ │ │ ├── CreateSectionModal.tsx
│ │ │ │ ├── SectionCard.tsx
│ │ │ │ └── ProfileDropdown.tsx
│ │ │ └── section/
│ │ │ ├── BillCard.tsx
│ │ │ ├── BillFormModal.tsx
│ │ │ ├── CalculatorPopover.tsx
│ │ │ ├── PieChart.tsx
│ │ │ ├── TagFilter.tsx
│ │ │ ├── ViewToggle.tsx
│ │ │ └── CalendarPicker.tsx
│ │ ├── pages/
│ │ │ ├── Home.tsx
│ │ │ ├── Dashboard.tsx
│ │ │ └── SectionPage.tsx
│ │ ├── hooks/
│ │ │ ├── useAuth.ts
│ │ │ ├── useBills.ts
│ │ │ └── useTheme.ts
│ │ ├── lib/
│ │ │ ├── api.ts
│ │ │ └── utils.ts
│ │ ├── types/
│ │ │ └── index.ts
│ │ ├── App.tsx
│ │ ├── main.tsx
│ │ └── index.css
│ ├── public/
│ ├── package.json
│ ├── tailwind.config.js
│ ├── components.json
│ └── tsconfig.json
└── README.md

text

## 🛠️ Installation

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Configure environment variables
node server.js
Frontend Setup
bash
cd frontend
npm install
cp .env.example .env  # Set API URL
npm run dev
🔒 Security Features
HttpOnly cookies for token storage

Rate limiting on authentication endpoints

Input validation and sanitization

MongoDB injection protection

XSS prevention measures

CORS configuration

No sensitive data in logs

🎨 Design Philosophy
Minimalist & Functional: Clean interface focused on essential features
Personal & Private: Your data stays on your device, no analytics tracking
Flexible & Customizable: Adapts to your personal tracking needs
Fast & Responsive: Optimized performance across all devices

📋 API Endpoints
POST /api/auth/register - Generate new account token

POST /api/auth/login - Authenticate with token

GET /api/sections - List user's expense sections

POST /api/bills - Add new expense

GET /api/bills - Filterable expense list with stats

🤝 Contributing
This is a personal project but suggestions are welcome! The codebase is structured for clarity and maintainability with comprehensive TypeScript types and consistent patterns.

📄 License
Personal Use - Not for redistribution.

