@echo off
setlocal EnableExtensions

set "ROOT_DIR=%~dp0.."
set "PY_CMD="
pushd "%ROOT_DIR%" >nul

call :ensure_python
if errorlevel 1 goto :fail

echo [1/4] Nang cap pip...
call %PY_CMD% -m pip install --upgrade pip
if errorlevel 1 goto :fail

echo [2/4] Cai package co ban...
call %PY_CMD% -m pip install -r requirements.txt
if errorlevel 1 goto :fail

echo [3/4] Cai package VieNeu...
call %PY_CMD% -m pip install -r requirements-vieneu.txt
if errorlevel 1 goto :fail

echo [4/4] Hoan tat. Dung lenh sau de chay server:
if /I "%PY_CMD%"=="python" (
  echo python scripts\start_vieneu.py
) else (
  echo py -3 scripts\start_vieneu.py
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

:fail
echo Setup that bai.
popd >nul
exit /b 1

:done
popd >nul
exit /b 0
