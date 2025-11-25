# Load environment variables from .env.local
$envFile = ".\.env.local"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*$' -or $_ -match '^\s*#') {
            # Skip empty lines and comments
        } else {
            $key, $value = $_ -split '=', 2
            [Environment]::SetEnvironmentVariable($key.Trim(), $value.Trim(), 'Process')
            Write-Host "Set $($key.Trim())"
        }
    }
    Write-Host "Environment variables loaded from $envFile`n"
} else {
    Write-Host "Warning: $envFile not found`n"
}

# Run the Spring Boot application with dev profile
Write-Host "Starting Spring Boot application with dev profile..."
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
