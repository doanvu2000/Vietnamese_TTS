@echo off
setlocal EnableExtensions

set "ROOT_DIR=%~dp0.."
pushd "%ROOT_DIR%" >nul

echo Dang clear env proxy/package index trong pham vi script...
set "ALL_PROXY="
set "HTTP_PROXY="
set "HTTPS_PROXY="
set "http_proxy="
set "https_proxy="
set "GIT_HTTP_PROXY="
set "GIT_HTTPS_PROXY="
set "PIP_NO_INDEX="
set "PIP_INDEX_URL="
set "PIP_EXTRA_INDEX_URL="

echo Dang chay setup Windows voi network env da duoc lam sach...
call .\scripts\setup_windows.cmd %*
set "EXIT_CODE=%ERRORLEVEL%"

popd >nul
exit /b %EXIT_CODE%
