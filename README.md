# 🌐 GeoSolver – Web-Based Geodetic Calculator

**GeoSolver** is a modern web application designed for performing precise geodetic calculations. It supports core surveying tasks such as coordinate transformations, angular and distance resection, polar methods, and more. The platform provides a clean UI with persistent storage of calculations via an integrated backend and cloud database.

---

## 🛠️ Technologies Used

### 🔷 Frontend
- [React 19.1.0](https://reactjs.org/) – Component-based architecture for a responsive SPA
- [React Router v7](https://reactrouter.com/) – For intuitive client-side routing
- [TailwindCSS v4](https://tailwindcss.com/) – Utility-first CSS framework
- [Axios](https://axios-http.com/) – HTTP client for API requests
- [jspdf](https://www.npmjs.com/package/jspdf) & [html2canvas](https://html2canvas.hertzen.com/) – PDF generation
- [React Helmet](https://github.com/nfl/react-helmet) – SEO management
- [Vercel](https://vercel.com/) – CI/CD and deployment

### 🔶 Backend
- [Node.js + Express](https://expressjs.com/) – RESTful API
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) – Cloud database
- [Railway](https://railway.app/) – Backend hosting
- [Mongoose](https://mongoosejs.com/) – MongoDB ODM

---

## ✨ Key Features

- Dynamic input forms for all core geodetic tasks
- Accurate real-time calculations for:
  - Forward intersection (1st Geodetic Task)
  - Angular resection (Back Intersection)
  - Polar intersection
  - Direction and distance computations
- PDF export functionality for calculation results
- Auto-typing animation for step-by-step visualization
- Save and view recent calculation history
- Toggle between light and dark themes
- SEO optimized with React Helmet
- Fully responsive design with TailwindCSS
- Modern UI with Montserrat typography

### 🔐 Authentication System
- Secure user registration and login
- JWT-based authentication
- Protected routes for authenticated users
- Password recovery via email
- Persistent login sessions
- Secure password storage with bcrypt
- CORS protection for API requests

---

## 🚀 Getting Started Locally

### 🔧 Frontend Setup

```bash
git clone https://github.com/<your-username>/geosolver.bg.git
cd geosolver.bg
npm install
npm start
```

The application will be available at `http://localhost:3000`

### 🔧 Backend Setup

```bash
cd ../geosolver-backend
npm install
npm start
```

The API will be available at `http://localhost:5000`

## 📦 Deployment

- Frontend: Automatically deployed via Vercel
- Backend: Automatically deployed to Railway
- MongoDB is provisioned via MongoDB Atlas

## 🏗️ Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── utils/         # Utility functions
├── styles/        # Global styles and Tailwind config
└── assets/        # Static assets
```

## 🧪 Development Guidelines

- Follow React best practices and hooks
- Use TailwindCSS for styling
- Implement responsive design
- Write clean, documented code
- Follow the established folder structure
- Implement proper authentication flows
- Handle API errors gracefully

## 📜 License

This project is licensed under the MIT License.

## 🤝 Contributions

We welcome contributions! Please fork the repo and submit a pull request. For major changes, open an issue first to discuss the idea.

## 📬 Contact
Created and maintained by **@valentinjelev**
Feel free to reach out for feedback, suggestions, or collaboration.