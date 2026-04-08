# PropConnect - Real Estate Comparison Platform 🏠

A full-stack, production-ready MERN application that allows users to seamlessly browse, filter, save, and side-by-side compare real estate properties in Hyderabad, India. It includes robust JWT authentication and a beautiful SaaS-like dark mode UI.

---

## 🎨 Tech Stack & Architecture

### **Frontend**
- **Framework:** React.js bootstrapped with Vite for exceptionally fast dev server and optimized chunked builds.
- **Styling:** Tailwind CSS v4 featuring CSS layer optimization explicitly structured natively into `index.css`. Includes Custom glass-morphism classes and gradient accents.
- **Routing:** Component-based protected routing handled via `react-router-dom`.
- **State Management:** React Context API for global User (`AuthContext`) and Comparison (`CompareContext`) state.
- **Data Fetching:** Axios is configured to handle REST APIs dynamically via Vite proxying during dev.
- **Icons & Alerts:** `lucide-react` for SVG icons and `react-hot-toast` for fluid notifications.

### **Backend**
- **Framework:** Node.js with Express.js backend.
- **Architecture:** Classic scalable MVC architecture (`models/`, `controllers/`, `routes/`, `middleware/`).
- **Authentication:** Token-based state securely handled per-request via `jsonwebtoken` (JWT) passed in Bearer headers.
- **API Protection:** Custom authentication middleware verifying JWT signatures on protected routes.
- **Global Error Handling:** Custom Express middleware intercepts exceptions instantly sending normalized JSON error responses preventing stack trace leaks.

### **Database (MongoDB)**
- **ODM:** Mongoose models with powerful validation, hooks, and timestamps schemas.
- **Data Models:**
  - `User`: Manages authentication using `bcryptjs` hashing securely via an async Mongoose `pre('save')` hook. References a `savedProperties` array.
  - `Property`: Huge collection scheme representing real-estate attributes like price, bedrooms, carpet area, status, location, etc.
  - `Contact`: Flat collection explicitly for capturing website contact form queries. 

---

## 🚀 Features

- **Robust Authentication:** Validated Email/Password user registration and login.
- **Dynamic Property Filtering:** Fully backend integrated filtering API allowing searches by *location*, *property type*, *furnishing*, and *min/max price limits*.
- **The "Shortlist" (Save functionality):** Users can securely add properties to their saved list using relational user references to build their personal wishlist in their profile (`/saved`).
- **Live Comparison Engine:** An interactive `/compare` page where users can mount up to 3 distinct properties. Details are presented in a unified table layout easily highlighting property differences.
- **Database Seeder:** Integrated `seedData.js` automation that clears and bootstraps the MongoDB Atlas cluster with 10 high-quality dummy real estate listings from top-tier areas around Hyderabad.

---

## 🗂 Project Structure

```
real-estate-platform/
│
├── backend/                  # Node.js + Express API
│   ├── controllers/          # API Handlers (auth, property, user hooks)
│   ├── middleware/           # authMiddleware & errorMiddleware
│   ├── models/               # Mongoose Schemas (User, Property, Contact)
│   ├── routes/               # Modular Express router endpoints
│   ├── seed/                 # Database population script
│   ├── server.js             # Main backend application entrypoint
│   └── package.json
│
├── frontend/                 # Vite + React Client
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── api/              # Axios global config/interceptors
│   │   ├── components/       # Reusable components (Navbar, PropertyCard, ComparisionTable)
│   │   ├── context/          # React Contexts (Auth & Compare)
│   │   ├── pages/            # Application views (Home, Compare, Saved, Auth)
│   │   ├── index.css         # Global layered Tailwind CSS rules
│   │   └── App.jsx           # App wrapper with unified routes & toast containers
│   ├── vite.config.js        # API Proxy configs
│   └── package.json
│
└── README.md
```

---

## 💻 Running the App Locally

### 1. Requirements
Ensure you have the following installed on your machine:
- Node.js (v18+)
- MongoDB Community Server (Running on `mongodb://localhost:27017` locally)

### 2. Configure Environment Variables
Inside the `/backend` folder, ensure your `.env` contains:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/real-estate-platform
JWT_SECRET=any_highly_secure_crypto_string
NODE_ENV=development
```

### 3. Bootstrap & Seed the Database
Populate your MongoDB with the initial top-tier property listings:
```bash
cd backend
npm install
npm run seed
```

### 4. Start the Application
You will need two separate terminal windows.

**Terminal 1 (Backend API):**
```bash
cd backend
npm run dev
# The API runs securely on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm install
npm run dev
# The Client UI runs locally on http://localhost:5173 
```

Visit **`http://localhost:5173`** and explore!
