# SmartBrief - AI-Powered Content Summarization SaaS

## 🚀 Project Overview

SmartBrief is a full-stack MERN application that leverages AI to provide intelligent content summarization services. Users can paste text or upload documents to receive concise, accurate summaries powered by advanced AI models.

## 📋 Features Implemented

### ✅ 1. Authentication (JWT-based)
- User registration and login with JWT tokens
- Password hashing with bcrypt
- 7-day token expiration
- Protected routes with authentication middleware
- **Note:** Email verification not implemented (optional feature)

### ✅ 2. Dynamic User Roles & Permissions
- **Roles:** `user`, `admin`, `editor`, `reviewer`
- **Admin:** Full access to user management and summaries
- **Editor:** Can update and delete any summary
- **Reviewer:** Can view all summaries, but cannot edit or delete
- **User:** Can only manage their own summaries
- Role-based access control (RBAC) middleware

### ✅ 3. Credit System
- New users start with **5 free credits**
- Each summarization costs **1 credit**
- Admin can recharge user credits via admin dashboard
- Real-time credit display on dashboard
- Credit validation middleware

### ✅ 4. AI Summarization
- Integrated **Groq API** with `gpt-oss-120b` model
- Accepts text input (100-50,000 characters)
- File upload support (`.txt` and `.docx`)
- Intelligent summarization with compression ratio tracking
- **Re-prompt feature:** Regenerate summaries with custom prompts (FREE - no credit charge!)
- Edit prompts before regeneration

### ✅ 5. Redux State Management
- **Redux Toolkit** for centralized state management
- User authentication state
- Summary state with async thunks
- Credit tracking and real-time updates

### ✅ 6. Summary Management
- View personal summary history with pagination
- Display timestamps, word counts, and compression ratios
- Regenerate summaries with custom prompts
- Delete summaries
- Role-based permissions for edit/delete

### ✅ 7. Caching (Redis)
- Redis-based caching for repeated queries
- Cache summaries per user and prompt combination
- Automatic cache invalidation on delete
- Reduces API calls and improves performance

### ✅ 8. Background Worker System
- **Bull Queue** for background job processing
- **Bull Board** dashboard for queue monitoring (`/admin/queues`)
- Three separate queues:
  - `summarization` - Text summarization jobs
  - `file-processing` - File upload processing
  - `email` - Email notifications (placeholder)
- Async endpoints with job status polling
- Progress tracking and error handling

### ✅ 9. Cron Jobs
- **node-cron** for scheduled tasks
- Daily cron job (midnight UTC) to deactivate inactive users (7+ days)
- Excludes admin users from automatic deactivation
- Graceful shutdown support

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js**
- **MongoDB** (MongoDB Atlas) with Mongoose
- **JWT** for authentication
- **Redis** for caching
- **Bull** + **Bull Board** for job queues
- **Groq SDK** for AI summarization
- **node-cron** for scheduled tasks
- **Multer** for file uploads
- **Mammoth** for .docx parsing

### Frontend
- **React 19.1.1** with Vite
- **Redux Toolkit** for state management
- **React Router Dom** for routing
- **Axios** for API calls
- **shadcn/ui** components
- **Tailwind CSS** for styling
- **Lucide React** for icons

## 📁 Project Structure

```
ai-powered-content-summarization/
├── backend/
│   ├── config/
│   │   ├── fileUpload.js      # Multer configuration
│   │   ├── queue.js            # Bull queue setup + Bull Board
│   │   ├── redisClient.js      # Redis connection
│   ├── controllers/
│   │   ├── adminController.js  # Admin operations
│   │   ├── authController.js   # Authentication
│   │   ├── summaryController.js # Summary CRUD + async operations
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT auth + RBAC + credit check
│   │   ├── cacheMiddleware.js  # Redis caching
│   ├── models/
│   │   ├── Summary.js          # Summary schema
│   │   ├── User.js             # User schema with roles
│   ├── routes/
│   │   ├── adminRoutes.js      # Admin endpoints
│   │   ├── auth.js             # Auth endpoints
│   │   ├── summaryRoutes.js    # Summary endpoints
│   │   ├── testRoutes.js       # Test/demo endpoints
│   ├── services/
│   │   ├── aiService.js        # Groq API integration
│   │   ├── cronService.js      # Cron job schedules
│   │   ├── fileProcessor.js    # File text extraction
│   │   ├── queueService.js     # Bull queue operations
│   ├── workers/
│   │   ├── index.js            # Worker process entry
│   │   ├── summarizationWorker.js
│   │   ├── fileProcessingWorker.js
│   │   ├── emailWorker.js
│   ├── createAdmin.js          # Admin user creation script
│   ├── index.js                # Main server file
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── redux/              # Redux store & slices
│   │   ├── services/           # API service layer
│   │   ├── router/             # React Router config
│   │   └── main.jsx            # App entry point
│   └── package.json
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- Redis (local or cloud)
- Groq API Key ([Get one here](https://console.groq.com/keys))

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```env
   # Server
   PORT=5000
   
   # MongoDB
   MONGO_URI=your_mongodb_connection_string
   
   # JWT
   JWT_SECRET=your_super_secret_jwt_key_here
   
   # Groq API
   GROQ_API_KEY=your_groq_api_key
   
   # Redis (optional but recommended)
   REDIS_HOST=localhost
   REDIS_PORT=6379
   # REDIS_PASSWORD=your_redis_password  # Uncomment if needed
   ```

4. **Create first admin user:**
   ```bash
   node createAdmin.js
   ```
   Default credentials:
   - Email: `admin@smartbrief.com`
   - Password: `Admin123!`
   
   **⚠️ IMPORTANT:** Change this password after first login!

5. **Start Redis (if local):**
   ```bash
   # Windows (with Redis installed)
   redis-server
   
   # macOS/Linux
   redis-server
   ```

6. **Start the API server:**
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:5000`

7. **Start the worker process (in a separate terminal):**
   ```bash
   npm run worker:dev
   ```

8. **Access Bull Board (Queue Dashboard):**
   Open `http://localhost:5000/admin/queues` in your browser

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

## 👥 Test User Credentials

### Admin User
- **Email:** `admin@smartbrief.com`
- **Password:** `Admin123!`
- **Role:** admin
- **Credits:** 100

### Demo User
- **Email:** `demo@smartbrief.com`
- **Password:** `demo123`
- **Role:** user
- **Credits:** 5

*You can create additional users via registration*

## 🔑 API Endpoints

### Authentication
```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login user
GET    /api/auth/me          - Get current user (protected)
```

### Summaries
```
POST   /api/summaries                  - Create summary (sync)
POST   /api/summaries/async            - Create summary (async - returns job ID)
POST   /api/summaries/upload           - Upload file for summary (sync)
POST   /api/summaries/upload/async     - Upload file (async)
GET    /api/summaries                  - Get user's summaries (paginated)
GET    /api/summaries/:id              - Get specific summary
POST   /api/summaries/:id/regenerate   - Regenerate with custom prompt (FREE)
DELETE /api/summaries/:id              - Delete summary
GET    /api/summaries/job/:jobId       - Check async job status
```

### Admin (Admin only)
```
GET    /api/admin/users           - Get all users
GET    /api/admin/users/:id       - Get specific user
PUT    /api/admin/users/:id/recharge  - Add credits to user
PUT    /api/admin/users/:id/role      - Update user role
DELETE /api/admin/users/:id       - Delete user
```

## 📊 Features Demonstration

### 1. **Create Summary from Text**
   - Paste content (100-50,000 chars)
   - Click "Summarize"
   - View compressed summary with stats

### 2. **Upload File**
   - Upload `.txt` or `.docx` file
   - Automatic text extraction
   - AI summarization with progress tracking

### 3. **Regenerate Summary**
   - Click "Regenerate" on existing summary
   - Add custom prompt (optional)
   - Get new summary **without using credits**

### 4. **Admin Dashboard**
   - View all users and statistics
   - Recharge user credits
   - Change user roles
   - Delete users

### 5. **Bull Board Monitoring**
   - Visit `/admin/queues`
   - View job queues in real-time
   - Monitor success/failure rates
   - Debug job errors

### 6. **Cron Job (Inactive Users)**
   - Runs daily at midnight UTC
   - Deactivates users inactive for 7+ days
   - Excludes admin users
   - Check logs for execution

## 🎯 Remaining Tasks

### ❌ **Deployment** (Not Completed)
- Backend hosting (Render/Railway/VPS)
- Frontend hosting (Vercel/Netlify)
- Environment variable configuration
- Production build optimization

### ⚠️ **Optional Enhancements**
- Email verification on registration
- Email notifications via email queue worker
- Websockets for real-time job updates
- Payment integration for credit purchases
- Advanced analytics dashboard

## 🐛 Known Issues

1. **Bull Board Access:** Currently accessible without authentication. In production, add admin authentication middleware.
2. **File Upload Size:** Limited to 5MB. Can be increased in `config/fileUpload.js`.
3. **Redis Optional:** App works without Redis but caching will be disabled.

## 📝 Environment Variables Reference

### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=long_random_secret_key
GROQ_API_KEY=gsk_xxxxxxxxxxxxx
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration
- [ ] User login
- [ ] Text summarization
- [ ] File upload summarization
- [ ] Credit deduction
- [ ] Summary history view
- [ ] Summary regeneration (free)
- [ ] Summary deletion
- [ ] Admin credit recharge
- [ ] Admin role management
- [ ] Bull Board queue monitoring
- [ ] Redis caching (check logs)
- [ ] Inactive user deactivation (wait or manually test cron)

### Test Cron Job Manually
```bash
# In backend directory, create a test script:
node -e "const { deactivateInactiveUsers } = require('./services/cronService'); deactivateInactiveUsers.now();"
```

## 📦 Production Deployment Guide

### Backend (Render/Railway)
1. Push code to GitHub
2. Create new Web Service
3. Set environment variables
4. Deploy
5. Start worker service separately (some platforms support background workers)

### Frontend (Vercel/Netlify)
1. Push code to GitHub
2. Import project
3. Set `VITE_API_URL` to production backend URL
4. Deploy

## 🤝 Contributing

This project was built as a technical assessment. For production use, consider:
- Adding comprehensive unit tests
- Implementing rate limiting
- Adding request validation with Joi/Yup
- Implementing proper logging (Winston/Morgan)
- Adding API documentation (Swagger)
- Setting up CI/CD pipeline

## 📄 License

MIT License

## 👨‍💻 Developer

Built by [Your Name] as part of a MERN Stack Developer assessment.

---

**⚠️ Security Note:** Never commit `.env` files or sensitive credentials to Git. Use environment variables in production.
