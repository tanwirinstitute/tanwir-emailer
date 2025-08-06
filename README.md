# Tanwir Emailer

A simple TypeScript Node.js application for sending financial aid acceptance emails.

## Features

- RESTful API endpoint for sending financial aid acceptance emails
- TypeScript for type safety
- Nodemailer for email sending
- Environment variable configuration
- Well-formatted HTML email template

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tanwir-emailer
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on the provided `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your SMTP server details.

### Development

To run the application in development mode with hot-reloading:

```bash
npm run dev
```

### Production

To build and run the application in production:

```bash
npm run build
npm start
```

## API Endpoints

### Send Financial Aid Acceptance Email

**Endpoint:** `POST /send-financial-aid-email`

**Request Body:**

```json
{
  "recipientEmail": "student@example.com",
  "studentName": "John Doe",
  "aidAmount": 10000,
  "academicYear": "2025-2026",
  "additionalDetails": "This includes a $2,000 merit scholarship."
}
```

**Required Fields:**
- `recipientEmail`: Email address of the recipient
- `studentName`: Full name of the student
- `aidAmount`: Financial aid amount (will be formatted as currency)
- `academicYear`: Academic year for the financial aid

**Optional Fields:**
- `additionalDetails`: Any additional information to include in the email

**Response:**

Success (200):
```json
{
  "success": true,
  "message": "Financial aid acceptance email sent successfully"
}
```

Error (400 - Bad Request):
```json
{
  "success": false,
  "message": "Missing required fields"
}
```

Error (500 - Server Error):
```json
{
  "success": false,
  "message": "Failed to send email",
  "error": "Error details"
}
```

### Health Check

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok"
}
```

## Email Template

The email includes:
- Personalized greeting with student's name
- Award amount formatted as currency
- Academic year information
- Instructions for accepting the award
- Contact information for questions
- Professional formatting with responsive design
