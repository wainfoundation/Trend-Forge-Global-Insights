# Trend Forge Backend

Backend API for Trend Forge - Global Insights Platform.

## Features

- User authentication (email/password and Pi Network)
- Article management
- Journalist portal
- Admin dashboard
- Firebase integration

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file with the following variables:
   ```
   PORT=8080
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-client-email
   FIREBASE_PRIVATE_KEY="your-private-key"
   FIREBASE_STORAGE_BUCKET=your-storage-bucket
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=securepassword
   ```

3. Start the server:
   ```
   npm start
   ```

## API Endpoints

### Authentication
- POST /api/auth/login - Login with email/password or Pi Network
- POST /api/auth/register - Register new user
- POST /api/auth/verify - Verify authentication token

### Articles
- GET /api/articles - Get all published articles
- GET /api/articles/:id - Get article by ID
- GET /api/articles/featured - Get featured articles
- GET /api/articles/category/:category - Get articles by category
- GET /api/articles/tag/:tag - Get articles by tag
- GET /api/articles/search - Search articles
- POST /api/articles/:id/like - Like an article
- POST /api/articles/:id/view - Record article view
- POST /api/articles/:id/comment - Comment on article
- GET /api/articles/:id/comments - Get article comments

### Journalist
- GET /api/journalist/profile - Get journalist profile
- PUT /api/journalist/profile - Update journalist profile
- GET /api/journalist/articles - Get journalist's articles
- POST /api/journalist/articles - Submit new article
- PUT /api/journalist/articles/:id - Update article
- DELETE /api/journalist/articles/:id - Delete article
- GET /api/journalist/earnings - Get journalist earnings

### Admin
- GET /api/admin/users - Get all users
- GET /api/admin/users/:id - Get user by ID
- PUT /api/admin/users/:id/role - Update user role
- DELETE /api/admin/users/:id - Delete user
- GET /api/admin/journalist-applications - Get journalist applications
- PUT /api/admin/journalist-applications/:id/approve - Approve journalist application
- PUT /api/admin/journalist-applications/:id/reject - Reject journalist application
- GET /api/admin/stats - Get site stats
- PUT /api/admin/settings - Update site settings

## Deployment

### Using Docker
```
docker build -t trend-forge-backend .
docker run -p 8080:8080 trend-forge-backend
```
