# Testing Documentation

## Overview
This document outlines the testing strategy for the Home Search application, covering both frontend and backend components.

## Frontend Testing

### Unit Tests
- Framework: Jest and React Testing Library
- Location: `home-search-frontend/src/components/tests/*.test.js`
- Command: `cd home-search-frontend && npm test`

### End-to-End Tests
- Framework: Cypress
- Location: `home-search-frontend/cypress/e2e/*.cy.js`
- Commands:
  - Interactive mode: `cd home-search-frontend && npm run cypress:open`
  - Headless mode: `cd home-search-frontend && npm run cypress:run`

## Backend Testing

### Unit and Integration Tests
- Framework: pytest
- Location: `backend/tests/*.py`
- Command: `cd backend && python -m pytest`

### Code Coverage
- Command: `cd backend && python -m pytest --cov=.`

## Key Test Cases

### Frontend
1. Property Search
   - Search by location
   - Search by price
   - Search by bedrooms/bathrooms
   - Complex search queries

2. User Interaction
   - Adding/removing favorites
   - Pagination
   - Navigation between pages

3. Chatbot Functionality
   - Sending queries
   - Receiving responses
   - Using chatbot to filter properties

### Backend
1. API Endpoints
   - Property retrieval
   - Search query parsing
   - Pagination handling

2. Data Processing
   - Database operations
   - Query building
   - Web scraping

## Continuous Integration
Tests run automatically via GitHub Actions when code is pushed to main/develop branches.