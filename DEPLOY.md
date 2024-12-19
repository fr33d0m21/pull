# Deployment Guide

This document outlines the deployment process for the Amazon Pullback Management System.

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- sudo access on the deployment server
- nginx installed and configured
- Git access to the repository

## Automatic Deployment

The application comes with an automated deployment script that handles the entire process.

### Using the Deployment Script

1. Make sure you're in the project root directory:
   ```bash
   cd /path/to/pullback
   ```

2. Run the deployment script:
   ```bash
   ./deploy.sh
   ```

The script will automatically:
- Install dependencies
- Run tests (if configured)
- Build the application
- Create a backup of the current deployment
- Deploy the new build
- Set proper permissions
- Restart nginx
- Log the deployment

### Manual Deployment Steps

If you need to deploy manually, follow these steps:

1. Pull the latest changes:
   ```bash
   git pull origin main
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the application:
   ```bash
   npm run build
   ```

4. Deploy to production directory:
   ```bash
   sudo mkdir -p /var/www/html/pullback
   sudo cp -r build/* /var/www/html/pullback/
   ```

5. Set permissions:
   ```bash
   sudo chown -R www-data:www-data /var/www/html/pullback
   sudo chmod -R 755 /var/www/html/pullback
   ```

6. Restart nginx:
   ```bash
   sudo systemctl restart nginx
   ```

## Troubleshooting

### Common Issues

1. **Build fails**
   - Check Node.js version
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`

2. **Permission issues**
   - Ensure you have sudo access
   - Check nginx user permissions
   - Verify file ownership and permissions

3. **Application not loading after deployment**
   - Check nginx configuration
   - Verify build files were copied correctly
   - Check nginx error logs: `sudo tail -f /var/log/nginx/error.log`

### Rollback Process

To rollback to a previous version:

1. Find the backup directory:
   ```bash
   ls -l /var/www/html/pullback_backup_*
   ```

2. Restore the backup:
   ```bash
   sudo rm -rf /var/www/html/pullback
   sudo mv /var/www/html/pullback_backup_[TIMESTAMP] /var/www/html/pullback
   sudo systemctl restart nginx
   ```

## Monitoring

- Check deployment logs: `tail -f deploy.log`
- Monitor nginx access logs: `sudo tail -f /var/log/nginx/access.log`
- Monitor nginx error logs: `sudo tail -f /var/log/nginx/error.log`

## Support

If you encounter any issues during deployment, please:

1. Check the deployment logs
2. Review nginx error logs
3. Contact the development team with:
   - Timestamp of the deployment
   - Any error messages
   - Steps to reproduce the issue 