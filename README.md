# PrintOS Dashboard Template

A modern, secure, and production-ready dashboard template built with **React** (Frontend) and **Python/Flask** (Backend). This template includes a pre-configured setup for MongoDB, Authentication (JWT), and deployment on Render.com.

## ?? Features

* **Frontend:** React, Tailwind CSS, Shadcn UI, Recharts.
* **Backend:** Python Flask, MongoDB integration.
* **Security:** JWT Authentication, Secure Environment Variables setup.
* **Deployment:** Ready-to-deploy configuration for Render.com (\ender.yaml\).

---

## ??? Installation & Setup

### 1. Clone the repository
\\\ash
git clone https://github.com/YOUR_USERNAME/PrintOS-Dashboard-Template.git
cd PrintOS-Dashboard-Template
\\\

### 2. Configuration (Secrets)
Copy the example file and add your MongoDB connection string:
\\\ash
cp .env.example .env
# Windows: copy .env.example .env
\\\
Edit \.env\ and fill in \MONGODB_URI\ and \JWT_SECRET_KEY\.

### 3. Backend Setup
\\\ash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
python server.py
\\\
*Server runs on: http://localhost:5000*

### 4. Frontend Setup
\\\ash
cd ../frontend
npm install
npm start
\\\
*App runs on: http://localhost:3000*

---

## ?? Project Structure

| Path | Description |
| :--- | :--- |
| \/backend\ | Flask API, Database Models |
| \/frontend\ | React App, Shadcn UI Components |
| \/tests\ | Backend & Integration Tests |
| \ender.yaml\ | Deployment Config for Render.com |

## ?? Deployment
See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed Render.com instructions.
