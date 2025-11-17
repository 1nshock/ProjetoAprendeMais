<#
run.ps1 - download Maven (user-local) and run mvn with given args.

Usage:
  .\run.ps1 clean package
  .\run.ps1 spring-boot:run

This script installs Maven under `.mvn-local` (only once) and prepends its bin to PATH for the current process.
It does not modify system/user environment variables permanently.
#>

param(
    [Parameter(ValueFromRemainingArguments=$true)]
    [String[]]$MavenArgs
)

if (-not (Get-Command java -ErrorAction SilentlyContinue)) {
    Write-Host "Java (java) não encontrado. Instale o JDK 17 antes de rodar." -ForegroundColor Red
    exit 1
}

$version = '3.9.4'
$zip = "apache-maven-$version-bin.zip"
$uri = "https://dlcdn.apache.org/maven/maven-3/$version/binaries/$zip"
$cacheRoot = Join-Path -Path $PSScriptRoot -ChildPath ".mvn-local"
$dest = Join-Path -Path $cacheRoot -ChildPath "apache-maven-$version"

if (-not (Test-Path $dest)) {
    New-Item -ItemType Directory -Force -Path $cacheRoot | Out-Null
    $tmp = Join-Path -Path $env:TEMP -ChildPath $zip
    Write-Host "Baixando Maven $version..." -NoNewline
    Invoke-WebRequest -Uri $uri -OutFile $tmp
    Write-Host " extraindo..."
    Expand-Archive -Path $tmp -DestinationPath $cacheRoot -Force
    Remove-Item $tmp -Force
}

$mvnBin = Join-Path -Path $dest -ChildPath 'bin'
if (-not (Test-Path (Join-Path $mvnBin 'mvn.cmd'))) {
    Write-Host "Erro: mvn não encontrado em $mvnBin" -ForegroundColor Red
    exit 1
}

$oldPath = $env:PATH
$env:PATH = "$mvnBin;$oldPath"

if ($MavenArgs.Length -eq 0) {
    # default action
    $MavenArgs = @('spring-boot:run')
}

& mvn @MavenArgs
$exitCode = $LASTEXITCODE
exit $exitCode
