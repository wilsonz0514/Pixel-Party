@echo off
setlocal
cd /d "%~dp0"

rem Reuse an existing Pixel Party server when one is already running.
rem Otherwise start one from this folder, then wait until it answers before
rem opening the browser (this avoids the intermittent "site can't be reached"
rem page caused by opening the tab too early).
powershell -NoProfile -ExecutionPolicy Bypass -Command "$listener=Get-NetTCPConnection -LocalPort 4174 -State Listen -ErrorAction SilentlyContinue; if(-not $listener){Start-Process -WindowStyle Hidden -FilePath 'C:\Users\qunwe\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' -ArgumentList @('-m','http.server','4174','--bind','127.0.0.1') -WorkingDirectory '%~dp0'}; $ok=$false; for($i=0;$i -lt 30;$i++){try{$r=Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:4174/' -TimeoutSec 1; if($r.StatusCode -eq 200){$ok=$true; break}}catch{}; Start-Sleep -Milliseconds 250}; if(-not $ok){exit 1}"
if errorlevel 1 (
  echo Pixel Party could not start on port 4174.
  echo Close any other program using that port, then run this file again.
  pause
  exit /b 1
)
start "" "http://127.0.0.1:4174/"
endlocal
