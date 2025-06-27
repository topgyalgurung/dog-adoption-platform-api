
# 🐶 Dog Adoption Platform API

This is a RESTful API backend for a Dog Adoption Platform built with Node.js, Express, and MongoDB Atlas. It enables users to register, authenticate, and manage dog adoption activities, including listing, registering, and adopting dogs.

---

## ✅ Features

- 🆕 **User Registration** – Create new accounts with secure password hashing
- 🔐 **User Authentication** – Login functionality with JWT (valid for 24 hours)
- 🐕 **Dog Registration** – Add dogs with name and description
- 🤝 **Dog Adoption** – Adopt dogs by ID with appropriate validation and thank-you messaging
- 🗑️ **Dog Removal** – Remove dogs with checks on ownership and adoption status
- 📋 **Dog Listing**
  - View all registered dogs (with filtering & pagination)
  - View adopted dogs (with filtering & pagination)

---

## 🧪 Testing

- API endpoints are tested using **Mocha** and **Chai**
- All critical routes are covered in the `/test` folder

---

## 🧠 Technical Highlights

### 📦 Data Model Design
- Uses **MongoDB Atlas** as a cloud database
- Models are structured to support user accounts, dog registration, and adoption
- Ensures scalability and logical relationships between users and dogs

### 🔗 Database Integration
- Seamlessly integrated MongoDB Atlas with Mongoose for schema validation and CRUD operations

### 🔐 Authentication & Authorization
- Passwords are hashed securely using bcrypt
- JWT-based token authentication for session management
- Tokens are issued with a 24-hour validity
- Proper HTTP headers are used to protect routes

### 🧭 Controller & Routing Design
- Modular **MVC architecture** with clean separation of:
  - **Models**: database schemas and operations
  - **Controllers**: business logic for each route
  - **Routes**: RESTful API endpoints
- Handles all major CRUD operations for users and dogs

### 🧾 JSON Parsing & Validation
- All request and response bodies are parsed as JSON
- Validation and error handling in place for incorrect or malformed payloads

### ⚠️ API Error Handling
- Graceful error responses with meaningful HTTP status codes
- Includes edge case coverage for invalid user actions

---

## 🧹 Code Quality

- Descriptive and consistent variable naming using **camelCase**
- Concise, readable code following JavaScript best practices
- Comments included where helpful to explain non-obvious logic

---

## 🚀 Getting Started

1. Clone the repo:
   ```bash
   $ git clone https://github.com/yourusername/dog-adoption-platform-api.git
   $ cd dog-adoption-platform-api
   ```

2. Install dependencies:
   ```bash
    $ npm install
    ```

3. Configure environment variables (.env) and (.env.test):
    ```bash
    #  .env
        PORT=3000
        MONGODB_URI=<your-mongo-uri>
        JWT_SECRET=<your-jwt-secret>

    # .env.test
        MONGODB_URI = <your-mongo-uri/test-db-name>
    ```
4. Run the server 
   ```bash
    $ npm start
    ```

5. Run test
   ```bash
   $ npm test
   ```
## 📍 API Routes

Below is a list of available RESTful API endpoints for the Dog Adoption Platform.

---

### 🧑 User Routes

| Method | Endpoint              | Description                           | Auth Required |
|--------|------------------------|---------------------------------------|---------------|
| POST   | `/api/users/register` | Register a new user (username, pw)                   | ❌            |
| POST   | `/api/users/login`    | Authenticate user and return a token | ❌            |

---

✅ After login, include the token in the `Authorization` header for all protected routes:

```http
Authorization: Bearer <your_token>
```

### 🐶 Dog Routes

| Method | Endpoint              | Description                                              | Auth Required |
|--------|------------------------|----------------------------------------------------------|---------------|
| POST   | `/api/dogs/register`  | Register a new dog (name(required), description)                   | ✅             |
| GET    | `/api/dogs/owned`     | List dogs owned by the logged-in user (with pagination)  | ✅            |
| GET    | `/api/dogs/adopted`   | List dogs adopted by the logged-in user                  | ✅            |
| POST   | `/api/dogs/adopt/:id` | Adopt a dog by ID                                        | ✅            |
| DELETE | `/api/dogs/:id`       | Delete a dog (must be owner, and not adopted)            | ✅            |

---

### 🧪 Testing (Optional)

Run all test cases for API routes using:

```bash
npm test

## 🛠️ TODO

- [ ] Build and integrate a frontend using **React**
- [ ] Create user-friendly forms for registration, login, and dog management
- [ ] Display dog listings with filtering and pagination
- [ ] Connect frontend to backend API using Axios or Fetch
    
--- 
The folder structure designed by our software architects ensures adherence to best practices:

- `controllers`: Contains the logic for handling incoming requests and returning responses to the client.
- `models`: Defines the data models and interacts directly with the database.
- `routes`: Manages the routes of your API, directing requests to the appropriate controller.
- `middlewares`: Houses custom middleware functions, including authentication and rate limiting.
- `.env`: Stores environment variables, such as database connection strings and the JWT secret.
- `app.js`: The main entry point of your application, where you configure the Express app and connect all the pieces.
- `db.js`: Manages the database connection.
- `package.json`: Keeps track of npm packages and scripts necessary for your project.
