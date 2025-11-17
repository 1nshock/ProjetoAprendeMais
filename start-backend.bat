@echo off
REM Script para iniciar o backend Spring Boot automaticamente
REM Autor: Projeto Aprende+
REM Data: 2025-11-17

echo.
echo ======================================
echo   Iniciando Backend - Aprende+
echo ======================================
echo.

REM Verificar se o JDK está instalado
java -version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Java (JDK) nao encontrado!
    echo.
    echo Por favor, instale o JDK 17 antes de prosseguir:
    echo https://adoptium.net/
    echo.
    pause
    exit /b 1
)

REM Mudar para a pasta do projeto
cd /d "%~dp0"

echo Iniciando Maven e compilando o projeto...
echo.

REM Executar o comando Maven
powershell -ExecutionPolicy Bypass -Command ".\run.ps1 spring-boot:run"

if errorlevel 1 (
    echo.
    echo ERRO ao iniciar o servidor!
    echo.
    pause
    exit /b 1
)

pause
