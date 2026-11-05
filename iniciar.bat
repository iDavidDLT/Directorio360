@echo off
cd /d "%~dp0"
if not exist .venv\Scripts\python.exe (
  echo Crea el entorno .venv e instala requirements.txt como indica README.md.
  pause
  exit /b 1
)
powershell -NoProfile -Command "$p=Read-Host 'Clave local de administracion' -AsSecureString; $env:ADMIN_PASSWORD=[Net.NetworkCredential]::new('', $p).Password; Write-Host 'Abre http://127.0.0.1:4173'; & .\.venv\Scripts\python.exe app.py"
pause
