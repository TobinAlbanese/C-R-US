#!/bin/bash

# Install backend dependencies (server folder)
echo "Installing backend dependencies..."
cd server
npm install
npm install express
cd ..

# Install frontend dependencies (client folder)
echo "Installing frontend dependencies..."
cd client
npm install
npm install express
cd ..

# Install C++ dependencies
echo "Installing C++ dependencies..."
# For example, installing Boost via Homebrew on macOS
brew install boost

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Install Java dependencies
echo "Installing Java dependencies..."
# Example: Using Maven to install Java dependencies
mvn install

# Install MongoDB locally (macOS)
echo "Installing MongoDB..."
brew tap mongodb/brew && brew install mongodb-community

# Install SQL Database (MySQL or PostgreSQL)
echo "Installing SQL Database (MySQL or PostgreSQL)..."
# Example: Installing MySQL on macOS (change as necessary for your OS)
brew install mysql

# Install PostgreSQL on macOS (alternative to MySQL)
# brew install postgresql

# Install bootstrap 
echo "Installing bootstrap..."
npm install bootstrap


# Final message
echo "All dependencies installed!"

