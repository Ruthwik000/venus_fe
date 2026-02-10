# Email Verification Testing Guide

## Quick Test Checklist

### ✅ Basic Signup Flow
- [ ] Navigate to `/signup`
- [ ] Fill in username, email (use real email!), password
- [ ] Submit form
- [ ] Should redirect to `/verify-email` page
- [ ] Check email inbox (check spam folder too)
- [ ] Click verification link in email
- [ ] Return to `/verify-email` page
- [ ] Click "I've Verified My Email"
- [ ] Should redirect to `/dashboard`

### ✅ Login with Unverified Email
- [ ] Create account but DON'T verify email
- [ ] Go to `/login`
- [ ] Enter email and password
- [ ] Should redirect to `/verify-email` (not show alert)
- [ ] Can resend verification email from this page

### ✅ Login with Verified Email
- [ ] Complete email verification (above test)
- [ ] Sign out
- [ ] Go to `/login`
- [ ] Enter email and password
- [ ] Should go directly to `/dashboard`

### ✅ Resend Verification Email
- [ ] Be on `/verify-email` page
- [ ] Click "Resend Verification Email"
- [ ] Should see success message
- [ ] Check email - new verification email received

### ✅ Error Cases
- [ ] Try weak password (less than 6 chars) - should show error
- [ ] Try invalid email format - should show error
- [ ] Try duplicate email - should show "already registered" error
- [ ] Try wrong password on login - should show error

### ✅ Google Sign-In (Unchanged)
- [ ] Google sign-in on signup page still works
- [ ] Google sign-in on login page still works
- [ ] No email verification required for Google users

## Common Issues & Solutions

### Issue: Verification email not received
**Solutions:**
1. Check spam/junk folder
2. Wait 1-2 minutes (Firebase can be slow)
3. Use "Resend Verification Email" button
4. Verify email address is typed correctly

### Issue: "Email already verified" error when resending
**Solution:** This is actually good! It means the email is already verified. Just click "I've Verified My Email" to proceed.

### Issue: Still can't log in after verifying
**Solution:** Make sure you clicked the verification link in the email AND clicked "I've Verified My Email" button on the verify-email page.

### Issue: Verification page says "not verified yet"
**Solution:** 
1. Make sure you clicked the link in the email
2. Wait a few seconds and try again
3. The link might have expired - use "Resend Verification Email"

## Firebase Console Checks

### View User Verification Status
1. Go to Firebase Console: https://console.firebase.google.com
2. Select project: venus-ab3d3
3. Go to Authentication → Users
4. Check "Email verified" column

### Check Email Delivery
1. Firebase Console → Authentication
2. Click "Templates" tab
3. View "Email address verification" template
4. Can customize message here

## Testing with Real Email Providers

### Gmail
- Usually instant delivery
- Check "Promotions" or "Updates" tabs
- Add firebase-noreply@gmail.com to contacts

### Outlook/Hotmail
- May take 1-2 minutes
- Check "Other" folder
- Mark as "Not Junk" if in spam

### Yahoo
- Similar to Outlook
- Check spam folder first

### Custom Domain Emails
- May have spam filters
- Whitelist firebase-noreply@*.firebaseapp.com
- Check with IT if corporate email

## Development vs Production

### Current Setup (Development)
- Using production Firebase project (venus-ab3d3)
- Real emails are sent
- Use real email addresses for testing

### Before Production Deployment
- [ ] Customize email templates in Firebase Console
- [ ] Add custom domain for email sending (optional)
- [ ] Test with multiple email providers
- [ ] Monitor Firebase Auth quota/usage
- [ ] Set up error tracking/logging

## Troubleshooting Commands

### Check if user is logged in (browser console):
```javascript
firebase.auth().currentUser
```

### Check if email is verified (browser console):
```javascript
firebase.auth().currentUser?.emailVerified
```

### Manually reload user data (browser console):
```javascript
await firebase.auth().currentUser?.reload()
console.log(firebase.auth().currentUser?.emailVerified)
```

### Force sign out (browser console):
```javascript
await firebase.auth().signOut()
localStorage.clear()
```

## Success Criteria

✅ Users cannot access dashboard without verified email
✅ Email verification flow is intuitive and user-friendly
✅ Error messages are clear and actionable
✅ Google Sign-In continues to work normally
✅ Users can resend verification emails
✅ Verification status updates immediately after verification

---

**Ready to test?** Start with the Basic Signup Flow above using a real email address!
