@echo off
set /p commit_msg=Enter commit message: 

git checkout main
git pull heroku main
git commit -m "%commit_msg%"
git push heroku main
pause