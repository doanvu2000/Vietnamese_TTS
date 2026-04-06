@echo off
setlocal EnableExtensions

set "ROOT_DIR=%~dp0.."
pushd "%ROOT_DIR%" >nul

where py >nul 2>nul
if not errorlevel 1 (
  py -3 -m http.server 8080 -d web
  set "EXIT_CODE=%ERRORLEVEL%"
  popd >nul
  exit /b %EXIT_CODE%
)

where python >nul 2>nul
if not errorlevel 1 (
  python -m http.server 8080 -d web
  set "EXIT_CODE=%ERRORLEVEL%"
  popd >nul
  exit /b %EXIT_CODE%
)

echo Khong tim thay Python. Hay chay .\scripts\setup_windows.cmd truoc.
popd >nul
exit /b 1
