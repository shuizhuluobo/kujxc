#!/bin/bash

# Install missing dependencies for semantic search feature

echo "Installing missing NestJS dependencies..."

# Install @nestjs/axios for HTTP requests
pnpm install @nestjs/axios axios

# Install cache-manager for Redis caching
pnpm install @nestjs/cache-manager cache-manager

# Install nodejieba for Chinese tokenization
pnpm install nodejieba

echo "All dependencies installed successfully!"
