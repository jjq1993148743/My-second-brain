@echo off
chcp 936 >nul
title WorkBuddy 链路启动器
setlocal

rem ---- 清代理变量：防止网关出站走错代理 ----
set "http_proxy="
set "https_proxy="
set "HTTP_PROXY="
set "HTTPS_PROXY="

set "ROOT=%~dp0"
set "CCS=D://Users//jjq21//AppData//Local//Programs//CC Switch\cc-switch.exe"

echo ================================================
echo   WorkBuddy2API - CC Switch - Codex
echo ================================================
echo.

rem ---- 1) 网关 ----
netstat -ano | findstr ":7863" | findstr "LISTENING" >nul 2>&1
if not errorlevel 1 (
  echo [1/2] 网关已在运行（:7863），跳过
) else (
  echo [1/2] 启动网关 wb2api.exe ...
  cd /d "%ROOT%WorkBuddy2API"
  start "WorkBuddy2API" /min wb2api.exe
  timeout /t 4 /nobreak >nul
)

rem ---- 2) CC Switch ----
tasklist /FI "IMAGENAME eq cc-switch.exe" 2>nul | findstr /I "cc-switch.exe" >nul
if not errorlevel 1 (
  echo [2/2] CC Switch 已在运行，跳过
) else (
  echo [2/2] 启动 CC Switch ...
  start "" "%CCS%"
  timeout /t 5 /nobreak >nul
)

echo.
echo 网关  : http://127.0.0.1:7863
echo 路由  : http://127.0.0.1:15721
echo 确认 CC Switch 托盘图标已出现、路由为「运行中」，即可直接用 Codex。
echo.
pause
