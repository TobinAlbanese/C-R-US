# Ensure running with admin privileges (for installing packages like Chocolatey)
if (-not (Test-Path "HKCU:\Software\Microsoft\PowerShell\1\ShellIds\Microsoft.PowerShell")) {
    Write-Host "Please run this script as Administrator to install required packages."
    exit
}

# Install dependencies for backend (server) folder
Write-Host "Installing backend dependencies (server)..."
Set-Location -Path "server"
npm install
npm install express
Set-Location -Path ".."

# Install dependencies for frontend (client) folder
Write-Host "Installing frontend dependencies (client)..."
Set-Location -Path "client"
npm install
npm install express
Set-Location -Path ".."

# Install C++ dependencies (Boost)
Write-Host "Installing C++ dependencies (Boost)..."
# Check if Chocolatey is installed
if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "Chocolatey not found. Installing Chocolatey..."
    Set-ExecutionPolicy Bypass -Scope Process -Force
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
}

# Install Boost using Chocolatey
Write-Host "Installing Boost..."
choco install boost -y

# Install Python dependencies
Write-Host "Installing Python dependencies..."
# Install Python if it's not already installed
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "Python not found. Installing Python..."
    choco install python -y
}

# Install Python requirements from the Windows-specific requirements.txt
pip install -r Windows-requirements.txt

# Install Java dependencies (If applicable, uncomment and use)
Write-Host "Installing Java dependencies..."
# For example: mvn install

# Install MongoDB (if needed)
Write-Host "Installing MongoDB..."
# For example, using Chocolatey to install MongoDB
choco install mongodb -y

# Install SQL Database (MySQL or PostgreSQL) (if needed)
Write-Host "Installing SQL Database (MySQL/PostgreSQL)..."
# Example: Installing MySQL
choco install mysql -y

Write-Host "All dependencies installed successfully!"

