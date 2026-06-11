@echo off
chcp 65001 >nul
echo ============================================
echo  Marx 本地预览启动中...
echo  启动后浏览器打开: http://localhost:4173/marx/
echo  关闭本窗口 = 停止预览
echo ============================================
cd /d "%~dp0"
call npm run preview
pause
