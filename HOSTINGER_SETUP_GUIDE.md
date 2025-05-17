# Hostinger Setup Guide for TrendForge.blog

This guide provides step-by-step instructions for setting up the TrendForge.blog domain on Hostinger and connecting it to Firebase Hosting.

## 1. Log in to Hostinger Control Panel

1. Go to [Hostinger.com](https://www.hostinger.com/)
2. Click "Log In" in the top right corner
3. Enter your credentials

## 2. Access Domain Settings

1. From the Hostinger dashboard, click on "Domains"
2. Find and select "trendforge.blog" from your domain list
3. Click on "DNS / Nameservers" in the left sidebar

## 3. Configure DNS Records

### Add A Records for Firebase Hosting

1. In the DNS Records section, click "Add Record"
2. Select "A" as the record type
3. For the first A record:
   - Leave "Host" field as "@" (represents the root domain)
   - Enter "151.101.1.195" in the "Points to" field
   - Set TTL to "3600" (1 hour)
   - Click "Add Record"
4. Repeat to add the second A record:
   - Leave "Host" field as "@"
   - Enter "151.101.65.195" in the "Points to" field
   - Set TTL to "3600"
   - Click "Add Record"

### Add CNAME Record for www Subdomain

1. Click "Add Record"
2. Select "CNAME" as the record type
3. Enter "www" in the "Host" field
4. Enter "trendforge.blog" in the "Points to" field
5. Set TTL to "3600"
6. Click "Add Record"

### Add TXT Record for Domain Verification

1. Click "Add Record"
2. Select "TXT" as the record type
3. Leave "Host" field as "@"
4. Enter the verification code provided by Firebase in the "TXT Value" field
   - Format: `firebase-site-verification=your-verification-code`
   - Note: You'll get this code during the Firebase domain setup process
5. Set TTL to "3600"
6. Click "Add Record"

## 4. Set Up Domain in Firebase

1. Log in to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project: "trend-forge---global-insights"
3. In the left sidebar, click "Hosting"
4. Click "Add custom domain"
5. Enter "trendforge.blog" and click "Continue"
6. Follow the verification steps
7. When prompted for domain ownership verification:
   - Select "Verify domain with TXT record"
   - Copy the provided TXT record value
   - Add this as a TXT record in Hostinger (as described above)
8. After adding the TXT record, return to Firebase and click "Verify"
9. Once verified, Firebase will provide you with the required A records
   - These should match the A records you already added (151.101.1.195 and 151.101.65.195)
10. Click "Continue" to finish the setup

## 5. Set Up www Subdomain in Firebase

1. In the Firebase Hosting section, click "Add another domain"
2. Enter "www.trendforge.blog" and click "Continue"
3. Select the option to redirect to your primary domain
4. Follow the verification steps (similar to the main domain)

## 6. Verify Domain Setup

1. Wait for DNS propagation (can take up to 48 hours)
2. Check status in Firebase Hosting console
3. Test your domain by visiting:
   - https://trendforge.blog
   - https://www.trendforge.blog

## 7. Domain Authorization Code

Keep your domain authorization code in a secure place:
```
rNmqjkyKduwhpunimyylvy4f7uwump
```

This code is required for domain transfers and certain administrative actions.

## 8. Email Setup (Optional)

If you want to set up email for your domain:

1. In Hostinger dashboard, go to "Emails"
2. Click "Create Email Account"
3. Follow the instructions to set up email accounts like:
   - admin@trendforge.blog
   - contact@trendforge.blog
   - support@trendforge.blog

## 9. Troubleshooting

If you encounter issues with your domain setup:

1. Verify all DNS records are correctly configured
2. Check for any error messages in the Firebase Hosting console
3. Use DNS propagation checkers like [DNSChecker](https://dnschecker.org/) to verify your records
4. Contact Hostinger support if you need assistance with DNS configuration
5. Contact Firebase support for hosting-related issues

## 10. Maintenance

Regularly check your domain settings:

1. Ensure your domain registration is up to date
2. Monitor SSL certificate status (Firebase handles renewal automatically)
3. Periodically verify all DNS records are correct
4. Keep your authorization code secure
