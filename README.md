# 📌 Momentum Fitness App

Momentum Fitness is a **comprehensive fitness tracking application** that allows users to monitor their **workouts, nutrition, sleep, and community engagement** all in one place.

The app is designed to help users stay **consistent, track progress, and connect with a supportive fitness community**.

---

## 1. Installation Guide

### **Step 1: Clone the Repository**
git clone https://github.com/your-username/momentum-fitness.git
cd momentum-fitness


### **Step 2: Install Dependencies
npm install


### **Step 3: Setup the Database
Initialize the database by running:

sqlite3 momentum_fitness.db < database.sql
This will create necessary tables and configure the database.

### **Step 4: Set Up Environment Variables
Create a .env file in the project root and add:

PORT=3000
SESSION_SECRET=your_secret_key


## 2. Running on Localhost
Start the Server
Run the following command to start the server:

npm start
The application will run on http://localhost:3000 by default.
Run in Development Mode
To automatically restart the server when changes are made:

npm run dev
This requires nodemon (installed with npm install).

## Ways to start the programme:
npm install 

npm run build-db

npm run start 

OR 

npm install

npm run build-db

node app.js

## 3. Database Setup
The application uses SQLite3 as its database.
To manually initialize the database, run:

sqlite3 momentum_fitness.db < database.sql
This will:

Create all necessary tables.
Set up relationships between users, meals, workouts, and communities.

## 4. Environment Variables
The project requires environment variables to be stored in a .env file.

Required Variables
Create a .env file in the root directory and add:

PORT=3000
SESSION_SECRET=your_secret_key
PORT: Define the port on which the server runs.
SESSION_SECRET: Used for session encryption and authentication.

## 5. Project Structure

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


## 6. API Routes
Authentication
GET /login → Renders login page.
POST /login → Handles user login.
GET /signup → Renders signup page.
POST /signup → Registers a new user.
GET /logout → Logs out user.
Fitness & Nutrition
GET /activities → Fetches fitness activities.
POST /activities/log → Logs user workout progress.
GET /nutrition → Fetches logged meals & meal plans.
POST /log-meal → Logs a meal.
POST /select-meal-plan → Selects a predefined meal plan.
Sleep Tracker
GET /sleep-tracker → Fetches sleep data.
POST /log/sleep → Logs sleep hours & quality.
Community Engagement
GET /communities → Fetches joined communities.
POST /communities/join → Joins a community.
POST /communities/post → Posts a discussion.

## 7. Screenshots
(Add screenshots of the UI for better visualization.)

## 8. Future Enhancements
✅ Upcoming Features
AI-powered meal recommendations
Google Fit & Apple Health integration
Workout video tutorials
Leaderboard for fitness challenges
Personalized fitness & health reports

## 9. Contributing
Want to contribute?
Fork the repo and create a pull request with detailed changes.

Report Issues
Found a bug? Open an issue here.

## 10. License
This project is open-source under the MIT License.

🚀 Enjoy using Momentum Fitness! Stay healthy & active! 🚀

