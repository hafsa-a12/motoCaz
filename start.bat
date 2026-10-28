@echo off
REM Lance le backend (port 8000) et le front (port 5173).
REM Pré-requis : MongoDB démarré, Backend\.env créé, "npm install" fait dans Backend et Front.
if not exist Backend\.env (
  echo [!] Backend\.env introuvable : copie Backend\.env.example vers Backend\.env et renseigne MONGO_URL et JWT_SECRET.
  pause
  exit /b 1
)
echo [1/2] Lancement du serveur backend...
start cmd /k "cd Backend && npm start"
timeout /t 3 > nul
echo [2/2] Lancement du site Front...
start cmd /k "cd Front && npm run dev"
