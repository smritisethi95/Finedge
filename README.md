# FinEdge 💰

A comprehensive **Personal Finance Management Application** built with Node.js, Express, and MongoDB. FinEdge helps users track income and expenses, manage budgets, get AI-powered spending recommendations, and gain insights into their financial health.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Project Requirements](#-project-requirements)
- [License](#-license)

---

## ✨ Features

### Core Features
- **User Authentication**: Secure JWT-based user registration and login
- **Transaction Management**: Track income and expenses with categories
- **Financial Summary**: View total income, expenses, and balance

### Advanced Features
- **Analytics & Reporting**: 
  - Calculate total income, expenses, and balance
  - Monthly spending trends
  - Category-wise spending analysis
  
- **AI-Powered Automation**:
  - Smart category suggestions based on keywords
  - Auto-categorize expenses (e.g., "walmart" → "Groceries")
  - Personalized spending recommendations
  - Real-time transaction updates

- **Advanced Middleware**:
  - Rate limiting (100 requests per 15 minutes)
  - CORS enabled
  - Request logging with Morgan
  - In-memory cache service with TTL for performance optimization

---

## 🛠 Tech Stack

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose ODM

**Authentication:**
- JWT (JSON Web Tokens)
- bcrypt for password hashing

**Validation:**
- Joi schema validation

**Testing:**
- Jest
- Supertest

**Other Tools:**
- dotenv for environment configuration
- express-rate-limit for API protection
- Morgan for HTTP request logging

---

## 📁 Project Structure

```
Finedge/
├── src/
│   ├── controllers/         # Request handlers
│   │   ├── userController.js
│   │   └── transactionController.js
│   ├── models/             # Mongoose schemas
│   │   ├── userModel.js
│   │   └── transactionModel.js
│   ├── routes/             # API routes
│   │   ├── userRoutes.js
│   │   └── transactionRoutes.js
│   ├── services/           # Business logic
│   │   ├── userService.js
│   │   ├── transactionService.js
│   │   └── analyticsService.js
│   ├── middleware/         # Custom middleware
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   ├── requestLogger.js
│   │   ├── validateRequest.js
│   │   └── rateLimiter.js
│   ├── schemas/            # Joi validation schemas
│   │   ├── userSchema.js
│   │   └── transactionSchema.js
│   ├── utils/              # Utility functions
│   │   ├── jwtHelper.js
│   │   ├── cacheService.js
│   │   └── categorizer.js
│   ├── errors/             # Custom error classes
│   │   ├── authError.js
│   │   ├── baseError.js
│   │   ├── entityError.js
│   │   └── requestError.js
│   ├── tests/              # Test suites
│   │   ├── user.test.js
│   │   ├── transaction.test.js
│   │   └── summary.test.js
│   ├── app.js              # Express app configuration
│   └── server.js           # Server entry point
├── .env.example            # Environment variables template
├── .gitignore
├── jest.config.js          # Jest configuration
├── package.json
└── README.md
```

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher) - Running locally or MongoDB Atlas
- **npm** or **yarn**

---

## 📥 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/finedge.git
   cd finedge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** (see below)

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/finedge
MONGODB_URI_TEST=mongodb://localhost:27017/finedge_test

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
JWT_EXPIRES_IN=7d
```

**Important:** 
- Change `JWT_SECRET` to a strong, random string in production
- Use MongoDB Atlas connection string for cloud database
- Never commit `.env` file to version control

---

## 🚀 Running the Application

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start at `http://localhost:3000` (or your configured PORT).

### Health Check
Visit `http://localhost:3000/health` to verify the server is running.

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000
```

---

### 🔓 Public Endpoints

#### 1. Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running",
  "timeStamp": "2026-03-08T10:30:00.000Z"
}
```

---

#### 2. User Registration
```http
POST /users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "65f...",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2026-03-08T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Validation Rules:**
- `name`: 3-30 characters, alphanumeric
- `email`: Valid email format
- `password`: 8-30 characters

---

#### 3. User Login
```http
POST /users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "user": {
      "_id": "65f...",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 🔒 Protected Endpoints

**All endpoints below require JWT authentication:**
```http
Authorization: Bearer <your-jwt-token>
```

---

#### 4. Get User by ID
```http
GET /users/:id
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "_id": "65f...",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-03-08T10:30:00.000Z"
  }
}
```

---

#### 5. Get All Users
```http
GET /users
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "All users found",
  "data": [
    {
      "_id": "65f...",
      "name": "John Doe",
      "email": "john@example.com"
    }
  ]
}
```

---

### 💰 Transaction Endpoints

#### 6. Create Transaction
```http
POST /api/v1/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "expense",
  "category": "walmart shopping",
  "amount": 150.50,
  "date": "2026-03-08"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Transaction created. Category auto-corrected to 'Groceries'.",
  "data": {
    "_id": "65f...",
    "userId": "65f...",
    "type": "expense",
    "category": "Groceries",
    "amount": 150.5,
    "date": "2026-03-08T00:00:00.000Z",
    "createdAt": "2026-03-08T10:30:00.000Z"
  }
}
```

**Transaction Types:**
- `income` - Money received
- `expense` - Money spent

**Auto-Categorization Keywords:**
- `Groceries`: walmart, grocery, supermarket, food, market
- `Dining`: restaurant, cafe, pizza, mcdonald, starbucks
- `Transportation`: uber, lyft, gas, fuel, parking
- `Entertainment`: movie, cinema, netflix, spotify
- `Utilities`: electric, water, internet, phone
- `Shopping`: amazon, clothing, mall

---

#### 7. Get All Transactions
```http
GET /api/v1/transactions
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": [
    {
      "_id": "65f...",
      "type": "income",
      "category": "Salary",
      "amount": 5000,
      "date": "2026-03-01T00:00:00.000Z"
    },
    {
      "_id": "65f...",
      "type": "expense",
      "category": "Groceries",
      "amount": 150.5,
      "date": "2026-03-08T00:00:00.000Z"
    }
  ]
}
```

---

#### 8. Get Transaction by ID
```http
GET /api/v1/transactions/:transactionId
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

#### 9. Update Transaction
```http
PATCH /api/v1/transactions/:transactionId
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 175.00,
  "category": "Groceries"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Transaction updated successfully",
  "data": {
    "_id": "65f...",
    "amount": 175,
    "category": "Groceries"
  }
}
```

---

#### 10. Delete Transaction
```http
DELETE /api/v1/transactions/:transactionId
Authorization: Bearer <token>
```

**Response:** `204 No Content`

---

### 📊 Analytics Endpoints

#### 11. Get Financial Summary
```http
GET /api/v1/transactions/summary
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Transaction summary retrieved successfully",
  "data": {
    "totalIncome": 5000,
    "totalExpense": 1250.75
  }
}
```

**Note:** Summary data is cached for 60 seconds for performance optimization.

---

#### 12. Get Spending Recommendations
```http
GET /api/v1/transactions/recommendations
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "category": "Dining",
      "currentSpending": 450,
      "lastMonthSpending": 300,
      "message": "Your Dining spending increased by 50.0%. Consider reducing to $300.00."
    },
    {
      "category": "Income",
      "message": "No income recorded this month. Add your income to track savings better."
    }
  ]
}
```

---

#### 13. Get Recent Transactions
```http
GET /api/v1/transactions/recent?since=2026-03-01T00:00:00.000Z
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    /* 10 most recent transactions */
  ]
}
```

---

## 🧪 Testing

The project includes comprehensive test suites using Jest and Supertest.

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite
```bash
npm test user.test.js
npm test transaction.test.js
npm test summary.test.js
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Test Coverage
```bash
npm test -- --coverage
```

### Test Suites Included:

**User Tests** (22 tests)
- User registration validation
- User login authentication
- JWT token generation and validation
- Protected route access control

**Transaction Tests** (30+ tests)
- Transaction CRUD operations
- Auto-categorization
- Input validation
- Authorization checks

**Summary Tests** (14 tests)
- Financial summary calculations
- Income and expense aggregation
- Cache functionality
- User isolation
- Edge cases (decimals, large amounts, many transactions)

---

## 📋 Project Requirements

This project fulfills all requirements for the FinEdge assignment:

### ✅ 1. Fundamentals & Setup (10 Points)
- [x] npm initialization
- [x] MVC architecture
- [x] /health route

### ✅ 2. REST API Development (30 Points)
- [x] User entity with authentication
- [x] Transaction entity (income/expense, category, amount, date)
- [x] Transaction CRUD endpoints (POST, GET, GET/:id, PATCH/:id, DELETE/:id)
- [x] GET /summary endpoint

**Note:** Budget entity model exists but CRUD endpoints not yet implemented

### ✅ 3. Async Programming & Middleware (20 Points)
- [x] Async/await for all DB operations
- [x] Global error-handling middleware
- [x] Request logging middleware
- [x] Input validation middleware
- [x] JWT authentication middleware

### ✅ 4. Advanced Node Concepts (20 Points)
- [x] Modular routes and controllers
- [x] Reusable service layer
- [x] Environment variables configuration
- [x] Custom error classes
- [x] Comprehensive test cases
- [x] JWT-based authentication

### ✅ 5. Bonus Features (20 Points)

**A. Analytics & Reporting**
- [x] Total income, expenses, and balance calculation
- [x] Filter by category and date
- [x] Monthly spending trends

**B. AI/Automation**
- [x] Spending recommendations based on past behavior
- [x] Auto-categorize expenses with keyword matching
- [x] Real-time transaction updates

**C. Data Persistence**
- [x] MongoDB with Mongoose

**D. Advanced Middleware**
- [x] Rate limiter (100 req/15min)
- [x] CORS enabled
- [x] Request logging with Morgan
- [x] In-memory cache with TTL for /summary

---

## 🔒 Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT-based authentication
- Protected routes with middleware
- Rate limiting to prevent abuse
- Input validation with Joi schemas
- CORS configuration
- Environment variable protection

---

## 🐛 Error Handling

The application includes comprehensive error handling:

- Custom error classes for different scenarios
- Global error handler middleware
- Appropriate HTTP status codes
- Detailed error messages in development
- Clean error responses in production

**Common Error Responses:**

```json
{
  "success": false,
  "error": "Error message here",
  "statusCode": 400
}
```

---

## 📝 License

ISC

---

## 👥 Contributors

- Your Name
- Team Members (if applicable)

---

## 🙏 Acknowledgments

- Airtribe for the project assignment
- MongoDB Documentation
- Express.js Documentation

---

## 📞 Support

For issues or questions, please create an issue in the GitHub repository.

---

**Built using Node.js and Express**