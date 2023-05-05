@echo off
set /p commit_msg=Enter commit message: 

git checkout main
git merge dev --no-ff -m "%commit_msg%"
git push origin main
pause