@echo off
REM Script para copiar arquivos HTML/CSS/JS para pasta static do Spring Boot

set SOURCE_DIR=%cd%
set TARGET_DIR=%cd%\src\main\resources\static

echo Limpando pasta target...
if exist "%TARGET_DIR%" (
    rmdir /S /Q "%TARGET_DIR%"
    timeout /t 1
)

echo Criando estrutura de pastas...
mkdir "%TARGET_DIR%"
mkdir "%TARGET_DIR%\css"
mkdir "%TARGET_DIR%\js"

echo Copiando arquivos HTML...
copy /Y "%SOURCE_DIR%\index.html" "%TARGET_DIR%\" >nul
copy /Y "%SOURCE_DIR%\Cadastro.html" "%TARGET_DIR%\" >nul
copy /Y "%SOURCE_DIR%\desenvolvimento.html" "%TARGET_DIR%\" >nul
copy /Y "%SOURCE_DIR%\menudeensino.html" "%TARGET_DIR%\" >nul
copy /Y "%SOURCE_DIR%\progresso.html" "%TARGET_DIR%\" >nul
copy /Y "%SOURCE_DIR%\provas.html" "%TARGET_DIR%\" >nul
copy /Y "%SOURCE_DIR%\salas.html" "%TARGET_DIR%\" >nul

echo Copiando arquivos CSS...
xcopy /E /I /Y "%SOURCE_DIR%\css\*" "%TARGET_DIR%\css\" >nul

echo Copiando arquivos JS...
xcopy /E /I /Y "%SOURCE_DIR%\js\*" "%TARGET_DIR%\js\" >nul

echo.
echo ========================================
echo Cópia concluída com sucesso!
echo ========================================
echo.
echo Arquivos copiados para:
echo %TARGET_DIR%
echo.
pause
