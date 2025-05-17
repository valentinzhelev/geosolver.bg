# 🌐 GeoSolver – Web-Based Geodetic Calculator

**GeoSolver** is a modern web application designed for performing precise geodetic calculations. It supports core surveying tasks such as coordinate transformations, angular and distance resection, polar methods, and more. The platform provides a clean UI with persistent storage of calculations via an integrated backend and cloud database.

---

## 🛠️ Technologies Used

### 🔷 Frontend
- [React](https://reactjs.org/) – Component-based architecture for a responsive SPA
- React Router – For intuitive client-side routing
- CSS + Font Awesome – Styling and iconography
- Vanilla JavaScript – Handles the geodetic calculation logic
- [Vercel](https://vercel.com/) – CI/CD and deployment for the frontend

### 🔶 Backend
- [Node.js + Express](https://expressjs.com/) – RESTful API for calculation history and processing
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) – Cloud database for persistent storage
- [Railway](https://railway.app/) – Backend hosting and CI pipeline
- Mongoose – ODM for defining and interacting with MongoDB models

---

## ✨ Key Features

- Dynamic input forms for all core geodetic tasks
- Accurate real-time calculations for:
  - Forward intersection (1st Geodetic Task)
  - Angular resection (Back Intersection)
  - Polar intersection
  - Direction and distance computations
- Auto-typing animation for step-by-step visualization
- Save and view recent calculation history
- Toggle between light and dark themes (UI)
- Fully responsive on desktop and mobile devices

---

## 🚀 Getting Started Locally

### 🔧 Frontend Setup

```bash
git clone https://github.com/<your-username>/geosolver.bg.git
cd geosolver.bg
npm install
npm start
```

## 🔧 Backend Setup

### The backend project is located in /geosolver-backend (if using the provided monorepo):

```bash
cd geosolver-backend
npm install
npm run dev
```

## 📦 Deployment

- Frontend: Automatically deployed via Vercel
- Backend: Automatically deployed to Railway
- MongoDB is provisioned via MongoDB Atlas

## 🧪 Roadmap

- Add support for more coordinate systems (e.g., UTM, BGS2005)
- User authentication and role-based access
- Export to DXF / CSV formats
- Enhanced visualization of results (SVG/sketch rendering)

## 📜 License

This project is licensed under the MIT License.

## 🤝 Contributions

We welcome contributions! Please fork the repo and submit a pull request. For major changes, open an issue first to discuss the idea.

## 📬 Contact
Created and maintained by **@valentinjelev**
Feel free to reach out for feedback, suggestions, or collaboration.