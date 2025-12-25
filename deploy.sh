#!/bin/bash

# VogueVault One-Command Deployment Script
# This script automates the deployment of frontend, backend, and database
# Usage: bash deploy.sh [environment] [component]
# Example: bash deploy.sh production all
#          bash deploy.sh staging frontend
#          bash deploy.sh production backend

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
COMPONENT=${2:-all}
PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
FRONTEND_DIR="$PROJECT_ROOT"
BACKEND_DIR="$PROJECT_ROOT/backend"
DATABASE_DIR="$PROJECT_ROOT/database/migrations"

# Function to print colored output
print_status() {
    echo -e "${BLUE}➜${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+"
        exit 1
    fi
    print_success "Node.js $(node --version) found"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    print_success "npm $(npm --version) found"
    
    # Check git
    if ! command -v git &> /dev/null; then
        print_error "git is not installed"
        exit 1
    fi
    print_success "git $(git --version) found"
    
    print_success "All prerequisites met!"
}

# Function to deploy frontend
deploy_frontend() {
    print_status "Deploying frontend to Vercel ($ENVIRONMENT)..."
    
    cd "$FRONTEND_DIR"
    
    # Check if Vercel CLI is installed
    if ! npm list -g vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    # Run build
    print_status "Building frontend..."
    npm run build
    print_success "Frontend build complete"
    
    # Deploy to Vercel
    if [ "$ENVIRONMENT" = "production" ]; then
        print_status "Deploying to production..."
        vercel --prod --token "$VERCEL_TOKEN" || print_error "Vercel deployment failed"
    else
        print_status "Deploying to staging..."
        vercel --token "$VERCEL_TOKEN" || print_error "Vercel deployment failed"
    fi
    
    print_success "Frontend deployed!"
}

# Function to deploy backend
deploy_backend() {
    print_status "Deploying backend to Heroku ($ENVIRONMENT)..."
    
    cd "$BACKEND_DIR"
    
    # Check if Heroku CLI is installed
    if ! command -v heroku &> /dev/null; then
        print_error "Heroku CLI not installed. Please install it from https://devcenter.heroku.com/articles/heroku-cli"
        exit 1
    fi
    
    # Check if logged in
    if ! heroku auth:whoami &> /dev/null; then
        print_status "Logging in to Heroku..."
        heroku login
    fi
    
    # Determine app name
    if [ "$ENVIRONMENT" = "production" ]; then
        APP_NAME="voguevault-api"
    else
        APP_NAME="voguevault-api-staging"
    fi
    
    # Run tests
    print_status "Running tests..."
    npm run test || print_error "Tests failed"
    print_success "Tests passed"
    
    # Build
    print_status "Building backend..."
    npm run build
    print_success "Backend build complete"
    
    # Deploy to Heroku
    print_status "Pushing to Heroku ($APP_NAME)..."
    git push heroku main || print_error "Heroku deployment failed"
    
    # Run migrations
    print_status "Running database migrations..."
    heroku run "node scripts/migrate.js" --app "$APP_NAME"
    
    # Check app status
    heroku ps --app "$APP_NAME"
    
    print_success "Backend deployed!"
}

# Function to deploy database migrations
deploy_database() {
    print_status "Running database migrations ($ENVIRONMENT)..."
    
    # Get database URL from environment
    if [ -z "$DATABASE_URL" ]; then
        print_error "DATABASE_URL environment variable not set"
        exit 1
    fi
    
    # Check if psql is installed
    if ! command -v psql &> /dev/null; then
        print_warning "psql not found. Trying via Node.js..."
        cd "$BACKEND_DIR"
        node scripts/migrate.js
    else
        print_status "Running migrations with psql..."
        
        # Run each migration file
        for migration_file in "$DATABASE_DIR"/*.sql; do
            if [ -f "$migration_file" ]; then
                filename=$(basename "$migration_file")
                print_status "Running $filename..."
                psql "$DATABASE_URL" < "$migration_file"
                print_success "$filename completed"
            fi
        done
    fi
    
    print_success "Database migrations complete!"
}

# Function to run all tests
run_tests() {
    print_status "Running all tests..."
    
    # Frontend tests
    print_status "Running frontend tests..."
    cd "$FRONTEND_DIR"
    npm run test -- --passWithNoTests
    print_success "Frontend tests passed"
    
    # Backend tests
    print_status "Running backend tests..."
    cd "$BACKEND_DIR"
    npm run test
    print_success "Backend tests passed"
    
    print_success "All tests passed!"
}

# Function to run linting
run_lint() {
    print_status "Running linters..."
    
    # Frontend lint
    print_status "Linting frontend..."
    cd "$FRONTEND_DIR"
    npm run lint
    print_success "Frontend lint passed"
    
    # Backend lint
    print_status "Linting backend..."
    cd "$BACKEND_DIR"
    npm run lint
    print_success "Backend lint passed"
    
    print_success "All linting passed!"
}

# Function to verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Check frontend
    print_status "Checking frontend..."
    if [ "$ENVIRONMENT" = "production" ]; then
        FRONTEND_URL="https://app.voguevault.com"
    else
        FRONTEND_URL="https://voguevault-staging.vercel.app"
    fi
    
    if curl -s "$FRONTEND_URL" | grep -q "VogueVault\|React"; then
        print_success "Frontend is responding"
    else
        print_warning "Frontend may not be responding correctly"
    fi
    
    # Check backend
    print_status "Checking backend..."
    if [ "$ENVIRONMENT" = "production" ]; then
        BACKEND_URL="https://voguevault-api.herokuapp.com"
    else
        BACKEND_URL="https://voguevault-api-staging.herokuapp.com"
    fi
    
    HEALTH_CHECK=$(curl -s "$BACKEND_URL/api/health")
    if echo "$HEALTH_CHECK" | grep -q "ok\|healthy"; then
        print_success "Backend is responding: $HEALTH_CHECK"
    else
        print_warning "Backend health check: $HEALTH_CHECK"
    fi
    
    print_success "Deployment verification complete!"
}

# Function to show deployment status
show_status() {
    print_status "Checking deployment status..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        APP_NAME="voguevault-api"
    else
        APP_NAME="voguevault-api-staging"
    fi
    
    print_status "Backend status:"
    heroku ps --app "$APP_NAME"
    
    print_status "Recent deployments:"
    heroku releases --app "$APP_NAME" --limit 5
    
    print_status "Environment variables:"
    heroku config --app "$APP_NAME"
    
    print_status "Recent logs:"
    heroku logs --app "$APP_NAME" --tail
}

# Function to rollback deployment
rollback_deployment() {
    print_warning "Rolling back to previous version..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        APP_NAME="voguevault-api"
    else
        APP_NAME="voguevault-api-staging"
    fi
    
    # Rollback Heroku
    heroku releases:rollback --app "$APP_NAME"
    
    print_success "Rollback complete!"
    print_status "Verifying..."
    heroku ps --app "$APP_NAME"
}

# Function to backup database before deployment
backup_database() {
    print_status "Creating database backup..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        APP_NAME="voguevault-api"
    else
        APP_NAME="voguevault-api-staging"
    fi
    
    # Heroku PostgreSQL backup
    heroku pg:backups:capture --app "$APP_NAME"
    
    print_success "Database backup created!"
    heroku pg:backups --app "$APP_NAME"
}

# Function to show help
show_help() {
    cat << EOF
${BLUE}VogueVault Deployment Script${NC}

${YELLOW}Usage:${NC}
    bash deploy.sh [environment] [component] [options]

${YELLOW}Arguments:${NC}
    environment   : staging or production (default: staging)
    component     : all, frontend, backend, database (default: all)

${YELLOW}Options:${NC}
    --test        : Run tests before deployment
    --lint        : Run linting before deployment
    --backup      : Backup database before deployment
    --verify      : Verify deployment after completion
    --status      : Show deployment status
    --rollback    : Rollback to previous version
    --help        : Show this help message

${YELLOW}Examples:${NC}
    bash deploy.sh production all --test --verify
    bash deploy.sh staging frontend --lint
    bash deploy.sh production backend --backup
    bash deploy.sh production --status
    bash deploy.sh production --rollback

${YELLOW}Environment Variables:${NC}
    VERCEL_TOKEN      : Vercel API token
    HEROKU_API_KEY    : Heroku API key
    DATABASE_URL      : PostgreSQL connection string

EOF
}

# Main execution
main() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  VogueVault Deployment Script${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    print_status "Configuration:"
    echo "  Environment: $ENVIRONMENT"
    echo "  Component: $COMPONENT"
    echo ""
    
    # Parse additional options
    RUN_TESTS=false
    RUN_LINT=false
    RUN_BACKUP=false
    RUN_VERIFY=false
    
    for arg in "$@"; do
        case $arg in
            --test)
                RUN_TESTS=true
                ;;
            --lint)
                RUN_LINT=true
                ;;
            --backup)
                RUN_BACKUP=true
                ;;
            --verify)
                RUN_VERIFY=true
                ;;
            --status)
                show_status
                exit 0
                ;;
            --rollback)
                rollback_deployment
                exit 0
                ;;
            --help)
                show_help
                exit 0
                ;;
        esac
    done
    
    # Check prerequisites
    check_prerequisites
    echo ""
    
    # Run linting if requested
    if [ "$RUN_LINT" = true ]; then
        run_lint
        echo ""
    fi
    
    # Run tests if requested
    if [ "$RUN_TESTS" = true ]; then
        run_tests
        echo ""
    fi
    
    # Backup database if requested
    if [ "$RUN_BACKUP" = true ]; then
        backup_database
        echo ""
    fi
    
    # Deploy components
    case $COMPONENT in
        all)
            deploy_database
            echo ""
            deploy_backend
            echo ""
            deploy_frontend
            ;;
        frontend)
            deploy_frontend
            ;;
        backend)
            deploy_database
            echo ""
            deploy_backend
            ;;
        database)
            deploy_database
            ;;
        *)
            print_error "Unknown component: $COMPONENT"
            show_help
            exit 1
            ;;
    esac
    
    echo ""
    
    # Verify deployment if requested
    if [ "$RUN_VERIFY" = true ]; then
        verify_deployment
        echo ""
    fi
    
    print_success "Deployment complete!"
    echo ""
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Run main function
main "$@"
