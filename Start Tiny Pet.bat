@echo off
cd /d "%~dp0"
where npm >nul 2>nul || (echo Node.js/npm is required. Install Node.js LTS, then run this again.&pause&exit /b 1)
if not exist node_modules call npm install
call npm start
