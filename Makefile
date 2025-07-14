# Makefile for Playwright Testing

# Default target
.PHONY: all
all: install test

# Install Playwright dependencies
.PHONY: install
install:
	npx playwright install

# Run specific Playwright test in headed mode
.PHONY: test
test:
	npx playwright test ./tests/happyend/loginwork\ _and_negative.spec.ts --headed
