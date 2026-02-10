# Quick Start Guide - Email Verification

## For Developers

### What Changed?

Email verification has been added to prevent fake emails during signup. Users must verify their email before accessing the app.

### Files to Know About

```
packages/chili-core/src/firebase.ts           - Auth service with new methods
packages/chili-web/src/pages/signup.ts        - Signup with email verification
packages/chili-web/src/pages/login.ts         - Login with verification check
packages/chili-web/src/pages/verify-email.ts  - New verification page
packages/chili-web/src/routes.ts              - Added /verify-email route
```

### New Methods Available

```typescript
// In authService from 'chili-core'

// Create account and send verification email
await authService.signUpWithEmail(email, password);

// Sign in with email/password
const user = await authService.signInWithEmail(email, password);

// Check if current user's email is verified
const isVerified = await authService.checkEmailVerified();

// Resend verification email
await authService.sendVerificationEmail();
```

### User Flow

```
Signup → Verify Email Page → Email Inbox → Click Link → Return → Dashboard
```

### Run the Project

```bash
# Navigate to project
cd C:\Users\ruthw\OneDrive\Desktop\venus_fe

# Install dependencies (if needed)
npm install

# Run development server
npm run dev

# Open browser to localhost (check console for port)
```

### Test It

1. Go to `/signup`
2. Use a **real email address** (check inbox/spam)
3. Create account
4. Check email for verification link
5. Click link
6. Return to verification page
7. Click "I've Verified My Email"
8. Should redirect to dashboard

### Common Development Tasks

#### Update Error Messages
Edit `packages/chili-core/src/firebase.ts` in the catch blocks

#### Customize Verification Email
Go to Firebase Console → Authentication → Templates → Edit "Email address verification"

#### Change Verification Page UI
Edit `packages/chili-web/src/pages/verify-email.ts`

#### Add Password Reset
Similar pattern - use `sendPasswordResetEmail()` from Firebase Auth

### Debugging

#### Check if user is signed in (browser console)
```javascript
console.log(firebase.auth().currentUser)
```

#### Check verification status (browser console)
```javascript
await firebase.auth().currentUser?.reload()
console.log(firebase.auth().currentUser?.emailVerified)
```

#### Clear auth state (browser console)
```javascript
await firebase.auth().signOut()
localStorage.clear()
location.reload()
```

### Firebase Console

Access: https://console.firebase.google.com
Project: venus-ab3d3

**Useful Sections:**
- Authentication → Users (see all users and verification status)
- Authentication → Templates (customize emails)
- Authentication → Settings (configure email sender)

### Important Notes

⚠️ **Use Real Emails for Testing**
Firebase sends actual emails. Use a real email address you can access.

✅ **Google Sign-In Unaffected**
Google authentication doesn't require email verification (Google handles it).

✅ **Verification Required**
Users CANNOT access dashboard/editor without verifying their email (except Google users).

⚠️ **Email Delivery Time**
Firebase emails can take 1-2 minutes. Check spam folder if not received.

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Email not received | Check spam folder, wait 2 minutes, use resend button |
| "Email already verified" error | User is verified! Just click "I've Verified My Email" |
| Can't login after verifying | Make sure you clicked the link AND the button on verify page |
| Build errors | Run `npm install` to ensure all dependencies are installed |

### Next Steps

- [ ] Test the flow with different email providers
- [ ] Customize email template in Firebase Console
- [ ] Add password reset functionality
- [ ] Move username to Firestore instead of localStorage
- [ ] Add rate limiting to resend email button
- [ ] Add analytics tracking

### Documentation

- Full docs: `EMAIL_VERIFICATION_DOCS.md`
- Testing guide: `TESTING_GUIDE.md`
- Summary: `IMPLEMENTATION_SUMMARY.md`

---

**Need Help?**
1. Read the full documentation in `EMAIL_VERIFICATION_DOCS.md`
2. Check `TESTING_GUIDE.md` for troubleshooting
3. Look at browser console for errors
4. Check Firebase Console for auth issues

**Ready to Code!** 🚀
