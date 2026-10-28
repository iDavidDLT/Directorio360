@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Instala Node.js 24 LTS para usar el servidor local.
  echo Tambien puedes abrir index.html directamente para revisar la pantalla.
  pause
  exit /b 1
)
echo Abre http://127.0.0.1:4173 en el navegador.
echo Para detener el servidor, presiona Ctrl+C.
node scripts\server.cjs
pause
