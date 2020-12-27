SHELL:=/bin/bash

.PHONY: help

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

build: ## Build production package
	@/bin/bash -c 'npm run build'

start: ## Start production server
	@/bin/bash -c 'npm run start'

install: ## Install dependencies
	@/bin/bash -c 'npm install'

development-server: ## Start development server
	@/bin/bash -c 'npm run dev'

build-nginx-image: ## Build nginx image
	@/bin/bash -c 'source ./provisioning/docker.sh && build_nginx_image'

run-nginx-container: ## Run nginx container
	@/bin/bash -c 'source ./provisioning/docker.sh && run_nginx_container'
