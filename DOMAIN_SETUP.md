# Domain Setup Guide for TrendForge

This document provides instructions for setting up and configuring the custom domain `trendforge.blog` for the TrendForge application.

## Domain Information

- **Domain Name**: trendforge.blog
- **Registrar**: Hostinger
- **Authorization Code**: rNmqjkyKduwhpunimyylvy4f7uwump

## DNS Configuration

### Required DNS Records for Firebase Hosting

Add the following DNS records in your Hostinger domain control panel:

#### A Records (for Firebase Hosting)

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 151.101.1.195 | 3600 |
| A | @ | 151.101.65.195 | 3600 |

#### CNAME Records

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | www | trendforge.blog | 3600 |

#### TXT Records (for Domain Verification)

| Type | Name | Value | TTL |
|------|------|-------|-----|
| TXT | @ | firebase-site-verification=your-verification-code | 3600 |

### Additional Records (if needed)

#### For Email Services

| Type | Name | Value | Priority | TTL |
|------|------|-------|----------|-----|
| MX | @ | mail.trendforge.blog | 10 | 3600 |
| TXT | @ | v=spf1 include:_spf.google.com ~all | - | 3600 |

## Firebase Hosting Configuration

1. Log in to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project: "trend-forge---global-insights"
3. Navigate to Hosting in the left sidebar
4. Click "Add custom domain"
5. Enter "trendforge.blog" and follow the verification steps
6. When prompted, use the authorization code: `rNmqjkyKduwhpunimyylvy4f7uwump`

## SSL Certificate

Firebase Hosting automatically provisions and renews SSL certificates for custom domains. After adding your domain to Firebase Hosting:

1. Wait for the SSL certificate to be provisioned (can take up to 24 hours)
2. Verify the certificate is active by checking the Hosting section in Firebase Console

## Verifying Domain Setup

After configuring DNS records and Firebase Hosting:

1. Wait for DNS propagation (can take up to 48 hours)
2. Test your domain by visiting https://trendforge.blog
3. Verify SSL is working correctly (lock icon in browser)
4. Test www subdomain redirect: https://www.trendforge.blog

## Troubleshooting

### Common Issues

1. **DNS Propagation Delay**: DNS changes can take up to 48 hours to propagate globally. If your domain isn't working immediately, wait and try again later.

2. **SSL Certificate Issues**: If you see SSL warnings, ensure your DNS records are correctly configured and wait for the certificate to be provisioned.

3. **Domain Verification Failure**: Double-check your TXT record for domain verification. It should match exactly what Firebase provides.

### Checking DNS Propagation

Use these tools to check DNS propagation:
- [DNSChecker](https://dnschecker.org/)
- [WhatsMyDNS](https://www.whatsmydns.net/)

### Firebase Hosting Status

Check the status of your domain in Firebase Hosting:
1. Go to Firebase Console > Hosting
2. Look for your domain in the "Custom Domains" section
3. Check the status column for any issues

## Contact Support

If you encounter persistent issues with your domain setup:

- **Hostinger Support**: support@hostinger.com
- **Firebase Support**: https://firebase.google.com/support
- **Project Support**: admin@trendforge.blog
