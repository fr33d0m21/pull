#!/bin/bash

# Print commands and exit on errors
set -ex

# Load environment variables if .env exists
if [ -f .env ]; then
    source .env
fi

echo "🚀 Starting deployment process..."

# Clean up previous build directories and set permissions
echo "🧹 Cleaning up previous build..."
if [ -d "dist" ]; then
    sudo rm -rf dist
fi
if [ -d "build" ]; then
    sudo rm -rf build
fi

# Clear system cache to free up memory
echo "🧹 Clearing system cache..."
sudo sync
sudo sh -c 'echo 3 > /proc/sys/vm/drop_caches'

# Ensure current user owns the project directory
echo "👤 Setting up project permissions..."
sudo chown -R $USER:$USER .

# Install dependencies
echo "📦 Installing dependencies..."
# Clear npm cache first
npm cache clean --force
# Install with reduced parallel processes
npm install --no-audit --no-fund --maxsockets 1

# Run tests if they exist
if [ -f "package.json" ] && grep -q "\"test\":" "package.json"; then
    echo "🧪 Running tests..."
    npm test
fi

# Build the application with increased memory limit
echo "🏗️ Building application..."
export NODE_OPTIONS="--max-old-space-size=4096"
# Clean node modules cache
npm cache clean --force
# Run build with optimized settings
NODE_ENV=production VITE_DISABLE_CACHE=true VITE_BUILD_MINIFY=false npm run build

# Check if build was successful
if [ ! -d "dist" ] && [ ! -d "build" ]; then
    echo "❌ Build failed - no dist or build directory found"
    exit 1
fi

# Deploy to production server
echo "📤 Deploying to production server..."

# Backup current deployment if it exists
if [ -d "/var/www/html/pullback" ]; then
    echo "📦 Creating backup of current deployment..."
    timestamp=$(date +%Y%m%d_%H%M%S)
    sudo mv /var/www/html/pullback "/var/www/html/pullback_backup_$timestamp"
fi

# Move new build to production directory
echo "🚚 Moving build to production directory..."
sudo mkdir -p /var/www/html/pullback
if [ -d "dist" ]; then
    sudo cp -r dist/* /var/www/html/pullback/
elif [ -d "build" ]; then
    sudo cp -r build/* /var/www/html/pullback/
fi

# Set proper permissions
echo "🔒 Setting proper permissions..."
sudo chown -R www-data:www-data /var/www/html/pullback
sudo chmod -R 755 /var/www/html/pullback

# Restart nginx
echo "🔄 Restarting nginx..."
sudo systemctl restart nginx

# Log deployment
echo "📝 Logging deployment..."
timestamp=$(date +"%Y-%m-%d %H:%M:%S")
echo "$timestamp - Deployment successful" >> deploy.log

# Clear cache again after build
echo "🧹 Final cache cleanup..."
sudo sync
sudo sh -c 'echo 3 > /proc/sys/vm/drop_caches'

echo "✅ Deployment completed successfully!" 