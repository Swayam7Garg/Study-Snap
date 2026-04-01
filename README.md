# AI-Enhanced Legal Aid Platform for First-Generation Litigants

## Project Title & Team Details
**Project:** AI-Enhanced Legal Aid Platform for First-Generation Litigants  
**Team Members:**  
1. Swayam Garg  
2. Yuvraj Pandiya  
3. Ajay Sahani  
4. Nikhil Singh Rajput  

## Problem Statement Overview
**Selected Problem:** WD-04  
**Core Solution Approach:**  
We are building a comprehensive legal aid web platform designed specifically for first-generation litigants who lack basic legal knowledge. 
- **Legal Situation Selector:** Users can select from categorized life events (e.g., landlord disputes, consumer complaints, workplace harassment, FIR filing).
- **Plain-Language Explanations:** The platform translates complex legal jargon and rights into simple, easy-to-understand terms tailored to the user's specific situation.
- **Actionable Guidance:** It lists relevant laws, generates a customized document checklist, and explains the necessary step-by-step procedures. 
- **Pro Bono Connection:** A legal aid directory seamlessly connects users with verified pro bono lawyers filtered by geographic location.
- **Automated Document Generation:** Finally, a built-in document template generator assists by producing properly formatted and filled-in complaint letters, RTIs, and legal notices automatically.

## Technical Architecture & Documentation (+3 Bonus Points Criteria)

### Architecture Diagram
```mermaid
graph TD
    UI[Frontend: React/Next.js UI]
    Gateway[API Gateway / Next.js API Routes]
    Auth[Authentication Service: Clerk/NextAuth]
    DB[(Database: PostgreSQL / Supabase)]
    AI[AI Engine: Google Gemini]
    Storage[File Storage/AWS S3]

    UI --> |Requests| Gateway
    Gateway --> |Validate Token| Auth
    Gateway --> |CRUD Operations| DB
    Gateway --> |Prompt Inject| AI
    Gateway --> |Document Templates| Storage
    AI --> |Simplified Legal Text| Gateway
    Storage --> |PDF Output| UI
    DB --> |Pro Bono Directory| Gateway
```

### System Workflow/User Flow
*(Eraser Prompt)*
```eraser
// User Flow structure for Eraser.io

User [icon: user] > "Lands on Homepage" 
"Lands on Homepage" > "Legal Situation Selector" [icon: layout]
"Legal Situation Selector" > "Selects Issue (e.g. Landlord Dispute)"

"Selects Issue (e.g. Landlord Dispute)" > "AI Translates Jargon" [icon: cpu]
"AI Translates Jargon" > "Displays Plain-Language Rights & Laws" [icon: book-open]
"Displays Plain-Language Rights & Laws" > "Generates Step-by-Step Procedure & Checklist" [icon: check-square]

"Generates Step-by-Step Procedure & Checklist" > "Two Action Paths"
"Two Action Paths" > "Path A: Document Template Generator" [icon: file-text]
"Two Action Paths" > "Path B: Pro Bono Lawyer Directory" [icon: users]

"Path A: Document Template Generator" > "User fills simple form"
"User fills simple form" > "Auto-generates filled Complaint/RTI PDF" [icon: download]

"Path B: Pro Bono Lawyer Directory" > "Filters by User Location" [icon: map-pin]
"Filters by User Location" > "Displays Contact Details of Pro Bono Lawyers"
```

## Setup and Installation Instructions

### Installation Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/Swayam7Garg/Legal-Aid-Platform.git
   cd Legal-Aid-Platform
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the environment variables (see below).
4. Run the development server:
   ```bash
   npm run dev
   ```

### Folder Structure Explanation
```bash
├── app/                  # Next.js App Router (Pages for routing)
│   ├── api/              # Backend serverless REST APIs
│   └── (routes)          # Frontend pages (home, selector, directories)
├── components/           # Reusable UI components (Forms, Cards, Modal)
├── lib/                  # Shared utility functions and database connections
├── models/               # Database ORM models/schemas
├── public/               # Static assets, fonts, and base document templates
└── .env.example          # Environment variable template
```

### Environment Variables
`.env.example`
```env
# Database
DATABASE_URL="postgres://user:pass@host/dbname"

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# AI APIs
GEMINI_API_KEY="AIzaSy..."

# Other Services
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Live Demo & Assets

**Live Working Demo Link:**  
<!-- Insert Link Here -->

**Screenshots/Screen Recording:**
<!-- Insert Screenshots Here -->


**Sample Test Inputs:**
- **Situation:** "My landlord is not returning my security deposit after 3 months."
- **Location Filter:** "New Delhi, India"
- **Document Generation Input:** 
  - Tenant Name: "Ravi Kumar"
  - Landlord Name: "Sunil Sharma"
  - Deposit Amount: "₹50,000"
  - Address: "Flat 4B, Sector 12, Dwarka"

## Domain-Specific Requirements

### Database Schema (ERD) & Role-Based Access Logic
```mermaid
erDiagram
    USERS ||--o{ CASES : files
    USERS ||--o{ DOCUMENTS : generates
    LAWYERS ||--o{ CASES : consults

    USERS {
        uuid id
        string name
        string email
        string role "USER or ADMIN"
    }
    LAWYERS {
        uuid id
        string name
        string location
        string expertise
        boolean pro_bono
    }
    CASES {
        uuid id
        uuid user_id
        string category
        string description
        string status
    }
    DOCUMENTS {
        uuid id
        uuid user_id
        string doc_type
        date generated_at
    }
```
**Role-Based Access Logic:**
- **Unregistered Users**: Can browse basic legal rights and access the legal situation selector.
- **Registered Users (Litigants)**: Can generate document templates, save their checklists, and view complete lawyer contact info.
- **Lawyers**: Have a verified profile dashboard to manage their availability and list the types of pro bono cases they accept.
- **Admins**: Can approve/verify lawyer accounts to ensure legitimacy and moderate public templates.

## Technical Ethics & Transparency

### AI Usage Declaration
**Declaration:** We utilized LLMs (Google Gemini) within the application for natural language processing, specifically to translate complex legal jargon into plain language. During the development process, GitHub Copilot was used to accelerate boilerplate code generation and optimize frontend styling. ChatGPT was referenced for architectural planning and debugging TypeScript errors.  
**Justification:** The AI translation within the app is strictly bounded by pre-defined system prompts to ensure it does NOT provide legal advice, but rather translates established facts. Copilot/ChatGPT were used securely without exposing sensitive proprietary data.

### Data Sources
1. **IndiaCode (Legislative Department):** Used to retrieve standard statutes and acts (e.g., Consumer Protection Act 2019, Rent Control Act).
2. **Open Data Portal (data.gov.in):** Used for geographic location scraping.
3. **Synthetic Data:** Yes, we extensively used synthetic data (fictional names, addresses, and hypothetical legal disputes) for populating the database and testing the platform without violating real user privacy.
