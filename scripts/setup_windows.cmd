@echo off
setlocal EnableExtensions

set "ROOT_DIR=%~dp0.."
set "PY_CMD="
set "START_AFTER_SETUP=1"
set "SETUP_OK=1"
if /I "%~1"=="--setup-only" set "START_AFTER_SETUP=0"
pushd "%ROOT_DIR%" >nul

call :ensure_python
if errorlevel 1 goto :fail

echo [1/4] Nang cap pip...
call %PY_CMD% -m pip install --upgrade pip
if errorlevel 1 call :mark_setup_failed "Khong nang cap duoc pip."

echo [2/4] Cai package co ban...
if "%SETUP_OK%"=="1" (
  call %PY_CMD% -m pip install -r requirements.txt
  if errorlevel 1 call :mark_setup_failed "Khong cai duoc requirements.txt."
)

echo [3/4] Cai package VieNeu...
if "%SETUP_OK%"=="1" (
  call %PY_CMD% -m pip install -r requirements-vieneu.txt
  if errorlevel 1 call :mark_setup_failed "Khong cai duoc package VieNeu."
)

if "%START_AFTER_SETUP%"=="1" (
  echo [4/4] Dang mo API server va web demo...
  call :start_apps
  if errorlevel 1 goto :fail
  echo Da mo xong 2 cua so:
  echo - API: http://127.0.0.1:8000
  echo - Web: http://127.0.0.1:8080
  if not "%SETUP_OK%"=="1" (
    echo.
    echo Luu y: setup package da loi, nen cua so API co the khong chay duoc backend vieneu.
    call :print_network_hint
  )
) else (
  if "%SETUP_OK%"=="1" (
    echo [4/4] Hoan tat. Dung lenh sau de chay server:
    if /I "%PY_CMD%"=="python" (
      echo python scripts\start_vieneu.py
    ) else (
      echo py -3 scripts\start_vieneu.py
    )
  ) else (
    echo [4/4] Setup chua hoan tat.
    call :print_network_hint
  )
)
goto :done

:ensure_python
where py >nul 2>nul
if not errorlevel 1 (
  set "PY_CMD=py -3"
  goto :eof
)

where python >nul 2>nul
if errorlevel 1 goto :install_python

set "PY_CMD=python"
echo Da co python trong PATH.
goto :eof

:install_python
echo Khong tim thay Python. Thu cai bang winget...
where winget >nul 2>nul
if errorlevel 1 (
  echo Khong tim thay winget. Hay cai Python 3.12+ roi chay lai script nay.
  exit /b 1
)

winget install -e --id Python.Python.3.12 --accept-package-agreements --accept-source-agreements
if errorlevel 1 (
  echo Cai Python bang winget that bai.
  exit /b 1
)

set "PATH=%LocalAppData%\Programs\Python\Python312;%LocalAppData%\Programs\Python\Python312\Scripts;%PATH%"
where py >nul 2>nul
if not errorlevel 1 (
  set "PY_CMD=py -3"
  goto :eof
)

where python >nul 2>nul
if errorlevel 1 (
  echo Python vua cai xong nhung chua vao PATH. Mo terminal moi va chay lai script.
  exit /b 1
)

python -V >nul 2>nul
if errorlevel 1 (
  echo Khong goi duoc python sau khi cai dat.
  exit /b 1
)

set "PY_CMD=python"
goto :eof

:mark_setup_failed
set "SETUP_OK=0"
echo.
echo %~1
echo Script van se co gang mo web demo neu Anh dang chay che do tu dong.
echo.
exit /b 0

:start_apps
if "%SETUP_OK%"=="1" (
  start "Vietnamese TTS API" cmd /k ""%ROOT_DIR%\scripts\run_api_vieneu.cmd""
  if errorlevel 1 exit /b 1
) else (
  start "Vietnamese TTS API" cmd /k "cd /d \"%ROOT_DIR%\" && echo Khong mo duoc API vieneu do setup package bi loi. && echo. && echo Web demo van da duoc mo rieng. && pause"
  if errorlevel 1 exit /b 1
)

start "Vietnamese TTS Web" cmd /k ""%ROOT_DIR%\scripts\run_web_demo.cmd""
if errorlevel 1 exit /b 1
exit /b 0

:print_network_hint
echo Kiem tra lai proxy/network truoc khi cai package:
echo - HTTP_PROXY / HTTPS_PROXY / GIT_HTTP_PROXY / GIT_HTTPS_PROXY
echo - PIP_NO_INDEX
echo Neu chi muon mo web tay, dung:
echo %PY_CMD% -m http.server 8080 -d web
exit /b 0

:fail
echo Setup that bai.
popd >nul
exit /b 1

:done
popd >nul
exit /b 0
