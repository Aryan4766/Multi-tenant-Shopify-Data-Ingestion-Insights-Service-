@echo off
echo Starting Xeno Frontend...

cd client
echo Installing frontend dependencies...
call npm install --force

echo Starting React development server...
call npm start

pause

