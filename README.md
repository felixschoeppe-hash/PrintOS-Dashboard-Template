PrintOS Dashboard – Gesamte Projektdokumentation
Dieses Dokument bündelt alle wichtigen Informationen, Konfigurationen und Anleitungen für das PrintOS Dashboard Template.

1. 📄 README.md (Projektübersicht)
A modern, secure, and production-ready dashboard template built with React (Frontend) and Python/Flask (Backend). This template includes a pre-configured setup for MongoDB, Authentication (JWT), and deployment on Render.com.

🚀 Features
Frontend: React 19, Tailwind CSS, Shadcn UI, Recharts.

Backend: Python FastAPI/Flask, MongoDB integration.

Security: JWT Authentication, Secure Environment Variables setup.

Deployment: Ready-to-deploy configuration for Render.com (render.yaml).

🛠️ Installation & Setup
1. Repository klonen
Bash
git clone https://github.com/felixschoeppe-hash/PrintOS-Dashboard-Template.git
cd PrintOS-Dashboard-Template
2. Konfiguration (Secrets)
Kopiere die Beispiel-Datei und füge deinen MongoDB Connection String ein:

Bash
cp .env.example .env
# Windows: copy .env.example .env
Bearbeite die .env und fülle MONGODB_URI sowie JWT_SECRET_KEY aus.

3. Backend Setup
Bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
python server.py
Server läuft auf: http://localhost:5000

4. Frontend Setup
Bash
cd ../frontend
npm install
npm start
App läuft auf: http://localhost:3000

2. ☁️ DEPLOYMENT.md (Checkliste für Render.com)
Vor dem Deployment
[ ] MongoDB Atlas eingerichtet und Connection String erhalten.

[ ] GitHub Repository erstellt und Code gepusht.

[ ] Render.com Account erstellt und GitHub verbunden.

Backend Deployment
Render Dashboard → "New +" → "Web Service".

Repository auswählen.

Konfiguration:

Name: printos-backend

Region: Frankfurt

Root Directory: backend

Build Command: pip install -r requirements.txt

Start Command: uvicorn server:app --host 0.0.0.0 --port $PORT

Environment Variables setzen: MONGO_URL, DB_NAME, JWT_SECRET_KEY, ENCRYPTION_SECRET, PYTHON_VERSION=3.11.0.

Frontend Deployment
Render Dashboard → "New +" → "Static Site".

Repository auswählen.

Konfiguration:

Name: printos-frontend

Build Command: yarn install && yarn build

Publish Directory: build

Environment Variables: NODE_VERSION=18, REACT_APP_API_URL=https://printos-backend.onrender.com.

3. 🔐 .env.example (Variablen-Struktur)
Bash
# --- Security Configuration ---
JWT_SECRET_KEY=changeme_long_random_string
ENCRYPTION_SECRET=changeme_another_random_string

# --- Database Configuration ---
MONGODB_URI=mongodb+srv://<db_user>:<db_password>@cluster0.example.mongodb.net/?appName=Cluster0
DB_NAME=printos_dashboard

# --- Frontend URL ---
FRONTEND_URL=http://localhost:3000

4. ⚙️ render.yaml (Infrastruktur-Code)
YAML
services:
  - type: web
    name: printos-backend
    env: python
    region: frankfurt
    buildCommand: pip install -r backend/requirements.txt
    startCommand: cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT
    healthCheckPath: /health
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
      - key: DB_NAME
        value: printos_dashboard
      - key: JWT_SECRET_KEY
        generateValue: true

  - type: web
    name: printos-frontend
    env: static
    region: frankfurt
    buildCommand: cd frontend && yarn install && yarn build
    staticPublishPath: ./frontend/build
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
    envVars:
      - key: REACT_APP_API_URL
        value: https://printos-backend.onrender.com

5. 🎨 design_guidelines.json (UI-Standards)
Typography: Headings: Manrope, Body: IBM Plex Sans, Data: JetBrains Mono.

Colors: Theme: Strict Dark Mode (Slate-950). Primary: Cyan-500.

Status Colors: Success: Teal-500, Error: Rose-500, Warning: Amber-500.

Visuals: Glassmorphism Effects, Neon Glows, Industrial spacing (compact).

Icons: Lucide-react (stroke 1.5px).