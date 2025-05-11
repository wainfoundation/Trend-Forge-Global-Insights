# Trend Forge - Pi-powered News Platform

A cross-platform news application built with React Native and Expo, powered by Pi Network cryptocurrency.

## Features

- Cross-platform support (iOS, Android, Web)
- Pi Network integration for payments and authentication
- Subscription plans with Pi cryptocurrency
- Journalist program with Pi rewards
- Article categories and search functionality
- User profiles and reading history
- Ad-free experience for subscribers
- Premium content access
- Donation system for supporting journalists

## Pi Network Integration

This application integrates with the Pi Network SDK to enable:

- User authentication via Pi Network
- Payments using Pi cryptocurrency
- Subscription plans
- Donations to journalists
- Rewarded ads

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- Pi Network Developer account (for Pi SDK features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/wainfoundation/Trend-Forge-Global-Insights.git
cd Trend-Forge-Global-Insights
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file based on `.env.example` and fill in your API keys.

4. Start the development server:
```bash
npx expo start
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

EXPO_PUBLIC_ADMIN_EMAIL=admin@example.com
EXPO_PUBLIC_ADMIN_PASSWORD=admin_password

CRYPTOCOMPARE_API_KEY=your_cryptocompare_api_key
NEWS_API_KEY=your_news_api_key

EXPO_PUBLIC_RORK_API_BASE_URL=https://your-api-base-url.com

# Pi Network API Key - Get this from the Pi Developer Portal
EXPO_PUBLIC_PI_API_KEY=your_pi_api_key
```

## Deployment

### Web

To deploy the web version:

1. Build the web app:
```bash
npx expo export:web
```

2. Deploy the `web-build` directory to your hosting provider.

### Mobile

To build standalone apps:

1. Configure app.json with your app details
2. Build for iOS/Android:
```bash
eas build --platform ios
eas build --platform android
```

## Pi SDK Troubleshooting

If you encounter issues with the Pi SDK not loading:

1. Make sure you're running the app in the Pi Browser for full functionality
2. Check that your Pi API key is correctly set in the .env file
3. Try the "Retry" or "Direct Load" buttons in the app interface
4. Ensure your app has the correct permissions in the Pi Developer Portal

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Pi Network for the cryptocurrency integration
- Expo team for the React Native framework
- All contributors to this project
