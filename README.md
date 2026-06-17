# ScrapeJobs 

A full-stack job aggregation platform built with **Next.js**, **Playwright**, and **Firebase** that scrapes remote job listings from multiple sources and displays them in a clean, searchable dashboard.

## Features

### Job Scraping

* Scrapes jobs from:

  * RemoteOK
  * We Work Remotely
* Automated data extraction using Playwright
* Deduplicates jobs before storing
* Batch writes to Firestore
* Source tagging and metadata tracking

### Dashboard

* Modern responsive UI
* Search jobs by:

  * Title
  * Company
  * Location
  * Skills / Tags
* Save jobs locally
* Direct application links
* Job source indicators
* Relative posting timestamps

### Resume Upload

* Upload PDF, DOC, DOCX resumes
* Drag & drop support
* Resume parsing pipeline ready

### Authentication

* Firebase Authentication
* Login
* Registration
* Google OAuth support

### Backend

* Next.js API Routes
* Playwright scraping engine
* Firebase Admin SDK
* Firestore integration
* Error handling and retry logic

---

## Tech Stack

### Frontend

* Next.js 16
* React
* Tailwind CSS
* Lucide Icons

### Backend

* Next.js Route Handlers
* Playwright

### Database & Auth

* Firebase Authentication
* Cloud Firestore
* Firebase Admin SDK

---

## Project Structure

```bash
app/
├── api/
│   ├── auth/
│   ├── scrape/
│   └── jobs/
│
├── dashboard/
│   └── jobs/
│
├── login/
├── register/
└── landing/

components/
├── DashboardLayout.jsx
└── Sidebar.jsx

lib/
├── firebase.ts
├── firebase-admin.ts
├── firestore.ts
└── scraper.ts
```

---

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

---

## Installation

```bash
git clone https://github.com/yourusername/scrapejobs.git

cd scrapejobs

pnpm install
```

---

## Run Development Server

```bash
pnpm dev
```

Open:

```bash
http://localhost:3000
```

---

## API Endpoints

### Scrape Jobs

```http
GET /api/scrape
```

Scrapes configured job sources and stores results in Firestore.

### Fetch Jobs

```http
GET /api/jobs
```

Returns all stored jobs.

---

## Future Improvements

* AI resume matching
* Job recommendations
* Scheduled scraping (cron jobs)
* Salary extraction
* Company insights
* Bookmark persistence
* Email alerts
* Multi-source aggregation

---

## Author

**Aditya Pandey**

Frontend Developer | Full Stack Learner

GitHub: https://github.com/BrownSplifff

```

Built to learn web scraping, backend architecture, automation, and full-stack development.
```
