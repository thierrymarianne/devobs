SHELL:=/bin/bash

## See also https://marmelab.com/blog/2016/02/29/auto-documented-makefile.html

.PHONY: help

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

build: ## Build package
	@/bin/bash -c 'export NODE_ENV="production" && rm -f dist/*css && rm -f dist/*js && npx webpack --config webpack.config.js --optimize-minimize --mode=production'

development-server: ## Start development server
	@/bin/bash -c 'export NODE_ENV="development" && npx webpack-serve --config ./webpack.config.js --port=8888 --open --content="dist"'

lint: ## Lint project files
	@/bin/bash -c 'npx eslint src/ .js'

stats: ## Statistics about dependencies
	@/bin/bash -c 'export NODE_ENV="production" && npx webpack --profile --json > stats.json'

unit-tests: ## Test components with karma
	@/bin/bash -c 'export NODE_ENV="test" && npx cross-env BABEL_ENV=test karma start ./karma.conf.js --auto-watch'
