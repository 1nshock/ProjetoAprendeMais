@echo off
REM Script para copiar arquivos HTML/CSS/JS para pasta static do Spring Boot

set SOURCE_DIR=%cd%
set TARGET_DIR=%cd%\src\main\resources\static

echo Copiando arquivos para Spring Boot...

REM Copiar arquivos HTML
copy /Y index.html "%TARGET_DIR%\"
copy /Y Cadastro.html "%TARGET_DIR%\"
copy /Y desenvolvimento.html "%TARGET_DIR%\"
copy /Y menudeensino.html "%TARGET_DIR%\"
copy /Y progresso.html "%TARGET_DIR%\"
copy /Y provas.html "%TARGET_DIR%\"
copy /Y salas.html "%TARGET_DIR%\"

REM Copiar pastas CSS e JS
xcopy /E /I /Y css "%TARGET_DIR%\css"
xcopy /E /I /Y js "%TARGET_DIR%\js"

echo Cópia concluída!
pause
