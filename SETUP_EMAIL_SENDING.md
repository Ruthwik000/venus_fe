# Setting Up Email Sending for Verification

## Problem
Browsers cannot send emails directly for security reasons. You need a backend service.

## Solution Options

### ⭐ RECOMMENDED: Firebase Extensions (Trigger Email)

This is the easiest way - no backend code needed!

#### Step 1: Install Firebase Extension

1. Go to Firebase Console → Extensions
2. Search for "Trigger Email"
3. Click "Install"
4. Configure:
   - **SMTP Connection URI**: Use one of these services:
     - Gmail: `smtps://username:password@smtp.gmail.com:465`
     - SendGrid: `smtps://apikey:YOUR_API_KEY@smtp.sendgrid.net:465`
     - AWS SES: `smtps://username:password@email-smtp.region.amazonaws.com:465`
   - **Default FROM address**: `noreply@yourdomain.com`
   - **Firestore collection**: `mail`

#### Step 2: Update Code to Use Extension

The extension watches a Firestore collection called `mail`. When you add a document, it sends the email automatically.

I'll update the code to use this...

### Alternative: Use a Backend Service

If you want more control, you can:

1. **Firebase Cloud Functions** (requires Blaze plan - pay as you go)
2. **Separate Node.js backend** (Express + Nodemailer)
3. **Third-party API** (SendGrid, Mailgun, AWS SES)

## Email Service Comparison

| Service | Free Tier | Setup Difficulty | Cost After Free |
|---------|-----------|------------------|-----------------|
| **Gmail SMTP** | 500/day | Easy | Free (with limits) |
| **SendGrid** | 100/day | Easy | $15/mo for 40k |
| **AWS SES** | 62k/month | Medium | $0.10 per 1000 |
| **Mailgun** | 5k/month | Easy | $35/mo for 50k |
| **Firebase Extension** | Depends on SMTP | Easy | SMTP provider cost |

## Quick Setup with Gmail (For Testing Only)

⚠️ **NOT for production** - Gmail has strict limits and may block your account

1. Enable 2-factor authentication on your Gmail
2. Create an App Password: https://myaccount.google.com/apppasswords
3. Use this SMTP URI: `smtps://your-email@gmail.com:app-password@smtp.gmail.com:465`

## Recommended for Production: SendGrid

1. Sign up at https://sendgrid.com (free 100 emails/day)
2. Create an API key
3. Use SMTP URI: `smtps://apikey:YOUR_API_KEY@smtp.sendgrid.net:465`

---

**Which option do you want to use?**
1. Firebase Extension (easiest)
2. SendGrid API (most reliable)
3. Gmail SMTP (testing only)
4. Custom backend (most control)

Let me know and I'll implement it!
