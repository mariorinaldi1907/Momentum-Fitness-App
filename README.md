# Momentum Fitness App

A **full-stack fitness tracking web application** that helps users track their **workouts, nutrition, sleep, body measurements**, and participate in **community discussions**. Built using **Node.js, Express.js, EJS, SQLite3**, and Bootstrap for frontend styling.

## Table of Contents
1. [Features](#features)
2. [Technology Stack](#technology-stack)
3. [Installation Guide](#installation-guide)
4. [Running on Localhost](#running-on-localhost)
5. [Database Setup](#database-setup)
6. [Environment Variables](#environment-variables)
7. [Project Structure](#project-structure)
8. [API Routes](#api-routes)
9. [Screenshots](#screenshots)
10. [Future Enhancements](#future-enhancements)

---

## 1. Features

### **User Authentication**
- Users can **sign up** and **log in** securely with **bcrypt password hashing**.
- **Session-based authentication** for persistent login.

### **Fitness Tracking**
- **Activities & Workouts:** Log and track exercise routines.
- **Nutrition Tracker:** Log meals and choose from **predefined meal plans**.
- **Sleep Tracker:** Log sleep hours and quality.
- **Body Measurements:** Track weight, BMI, body fat percentage, and muscle mass.

### **Community Engagement**
- Users can **join communities** and discuss fitness topics.
- **Community forums** for sharing posts and comments.

### **Dashboard**
- Shows **fitness progress, meal plans, latest activities, and sleep data**.
- Highlights **featured fitness programs** in a carousel.

### **Progress Visualization**
- Interactive **charts and progress bars** for tracking **calories, protein, and fitness goals**.

---

## 2. Technology Stack

### **Backend**
- **Node.js** with **Express.js**
- **SQLite3** (Lightweight database)
- **bcrypt.js** (Password hashing)
- **Express-Session** (User authentication)

### **Frontend**
- **EJS (Embedded JavaScript Templates)** for dynamic content rendering
- **Bootstrap 5** for UI design
- **Chart.js** for progress visualization

---

## 3. Installation Guide

### **Prerequisites**
Ensure you have the following installed:
- **Node.js** (LTS version recommended)
- **SQLite3** (For database management)
- **Git** (To clone the repository)

### **Steps to Install**
1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/momentum-fitness.git
   cd momentum-fitness
Install dependencies

bash
Copy
Edit
npm install
Set up environment variables

Create a .env file in the root directory:
env
Copy
Edit
PORT=3000
SESSION_SECRET=your_secret_key
Set up the database

bash
Copy
Edit
npm run setup-db
This will execute database.sql and create the necessary tables.
4. Running on Localhost
Start the server
bash
Copy
Edit
npm start
The app will run on http://localhost:3000 by default.
Alternative (Using nodemon for development)
bash
Copy
Edit
npm run dev
This will automatically restart the server on code changes.
5. Database Setup
The app uses SQLite3 for lightweight storage.
To manually reset and set up the database:

bash
Copy
Edit
sqlite3 momentum_fitness.db < database.sql
This will execute all CREATE TABLE queries and prepare the database.
6. Environment Variables
The app uses a .env file for secret configurations.
Ensure the following variables are correctly set:
env
Copy
Edit
PORT=3000
SESSION_SECRET=your_secret_key
You can also customize PORT if needed.
7. Project Structure
bash
Copy
Edit
momentum-fitness/
│-- public/               # Static assets (CSS, images)
│-- views/                # EJS templates for frontend
│-- routes/               # Express.js route handlers
│   │-- auth.js           # Login & Signup routes
│   │-- activities.js     # Activity & workout tracking
│   │-- nutrition.js      # Meal tracking & meal plans
│   │-- sleep_tracker.js  # Sleep tracker
│   │-- communities.js    # Community forum & discussions
│   └-- index.js          # Main route file
│-- database.sql          # SQLite3 schema
│-- db.js                 # Database connection
│-- app.js                # Main server file
│-- package.json          # Dependencies & scripts
└-- .env                  # Environment variables
8. API Routes
Authentication
GET /login → Renders login page
POST /login → Handles user login
GET /signup → Renders signup page
POST /signup → Registers new user
GET /logout → Logs out user
Fitness & Nutrition
GET /activities → Fetches fitness activities
POST /activities/log → Logs user progress
GET /nutrition → Fetches logged meals & meal plans
POST /log-meal → Logs a meal
POST /select-meal-plan → Selects a predefined meal plan
Sleep Tracker
GET /sleep-tracker → Fetches sleep data
POST /log/sleep → Logs sleep hours & quality
Community
GET /communities → Fetches joined communities
POST /communities/join → Joins a community
POST /communities/post → Posts a discussion
9. Screenshots
(Add relevant UI screenshots here for better visualization.)

10. Future Enhancements
✅ Upcoming Features
AI-powered meal recommendations
Google Fit & Apple Health integration
Workout video tutorials
Leaderboard for fitness challenges
Contributing
Want to contribute?
Fork the repo and create a pull request with detailed changes.

Report Issues
Found a bug? Open an issue here.

License
This project is open-source under the MIT License.

🚀 Enjoy using Momentum Fitness! Stay healthy & active! 🚀