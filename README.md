# GeoSolver - Professional Geodetic Calculator

A comprehensive web-based geodetic calculation platform designed for surveying professionals. GeoSolver provides accurate solutions for complex geodetic problems including coordinate transformations, intersection methods, and area calculations with a modern, responsive interface.

## Overview

GeoSolver is a full-stack web application that combines advanced geodetic algorithms with modern web technologies to deliver precise surveying calculations. The platform serves both individual professionals and educational institutions with its intuitive interface and comprehensive calculation suite.

## Technical Stack

### Frontend
- **React 19.1.0** - Modern component-based architecture with hooks
- **React Router v7** - Client-side routing with protected routes
- **TailwindCSS v4** - Utility-first CSS framework for responsive design
- **Axios** - HTTP client for API communication
- **React Helmet** - SEO optimization and meta tag management
- **jspdf & html2canvas** - PDF generation for calculation reports

### Backend
- **Node.js & Express** - RESTful API server
- **MongoDB Atlas** - Cloud database with Mongoose ODM
- **JWT Authentication** - Secure user authentication system
- **bcrypt** - Password hashing and security
- **CORS** - Cross-origin resource sharing configuration

### Deployment & Infrastructure
- **Vercel** - Frontend hosting with automatic CI/CD
- **Railway** - Backend hosting and deployment
- **MongoDB Atlas** - Managed cloud database

## Core Features

### Geodetic Calculations
- First / second basic task, forward & reverse intersections, polar, Hansen
- Line intersection, orthogonal offset, segment division
- Affine coordinate transforms + **BGS2005 CRS** (CCS2005 / UTM 34N–35N via proj4)
- Area and distance/bearing tools

### Survey workspace
- Points library, map (plan / profile / OSM), project hub
- GNSS import (CSV/GPX/RINEX header), NMEA live, field log (cloud)
- Stake-out with CRS transform from WGS84
- Firm workspaces (roles: viewer / editor / admin)

### User Experience
- Responsive design, dark/light theme, BG/EN
- PWA install + offline shell caching
- PDF / DXF / GeoJSON / ZIP exports
- Developed and maintained by [Wortexa](https://wortexa.com/)

### Security & Authentication
- JWT-based authentication system
- Secure password storage with bcrypt
- Protected routes and API endpoints
- CORS protection
- Input validation and sanitization

## Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout and navigation
│   ├── pages/          # Page components
│   ├── shared/         # Reusable UI components
│   └── tasks/          # Calculation tool components
├── config/             # API and configuration files
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── services/           # API service functions
└── translations/       # Internationalization
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (for backend)
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/geosolver.bg.git
cd geosolver.bg
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

### Backend Setup

The backend is a separate Node.js application. For detailed setup instructions, API documentation, and backend-specific information, please refer to the [GeoSolver Backend Repository](https://github.com/valentinzhelev/geosolver-backend).

## Development

### Code Standards
- Follow React best practices and functional components
- Use TypeScript for type safety (planned migration)
- Implement responsive design with TailwindCSS
- Write clean, documented code with JSDoc comments
- Follow established folder structure and naming conventions

### Testing
- Unit tests for calculation algorithms
- Integration tests for API endpoints
- End-to-end testing with Cypress (planned)

### Performance Optimization
- Code splitting and lazy loading
- Image optimization and compression
- API response caching
- Bundle size optimization

## Deployment

The application is configured for automatic deployment:
- Frontend deploys to Vercel on push to main branch
- Backend deploys to Railway with MongoDB Atlas integration
- Environment variables are managed through deployment platforms

## API Documentation

The backend provides RESTful APIs for:
- User authentication and management
- Calculation storage and retrieval
- PDF generation services
- Data export functionality

For complete API documentation, endpoints, and backend architecture details, visit the [GeoSolver Backend Repository](https://github.com/valentinzhelev/geosolver-backend).

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

**Valentin Zhelev**
- LinkedIn: [linkedin.com/in/valentinzhelev](https://www.linkedin.com/in/valentin-zhelev-9b5b30346/)
- Email: valentin.zhelevbg@gmail.com