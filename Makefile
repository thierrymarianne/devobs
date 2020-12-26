SHELL:=/bin/bash

## See also https://marmelab.com/blog/2016/02/29/auto-documented-makefile.html

.PHONY: help

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

build: ## Build production package
	@/bin/bash -c '( test -e .env && source .env || true ) && npx nuxt-ts generate'

start: ## Start production server
	@/bin/bash -c 'source .env && npx nuxt-ts start'

development-server: ## Start development server
	@/bin/bash -c 'source .env && npx nuxt-ts'

build-nginx-image: ## Build nginx image
	@/bin/bash -c 'source ./provisioning/docker.sh && build_nginx_image'

run-nginx-container: ## Run nginx container
	@/bin/bash -c 'source ./provisioning/docker.sh && run_nginx_container'
