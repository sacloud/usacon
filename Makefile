AUTHOR          ?="The UsaCon Authors"
COPYRIGHT_YEAR  ?="2020-2021"
COPYRIGHT_FILES ?=$$(find . \( -name "*.ts" -or -name "*.tsx" -or -name "*.js" -or -name "*.jsx" -or -name "*.css" -or -name "*.html" -or -name "*.go" \) -print | grep -v "/vendor/" | grep -v "/dist/" | grep -v "/node_modules" )

default: build

.PHONY: build
build: set-license fmt
	yarn build

.PHONY: release-build
release-build: set-license fmt
	yarn build:production

.PHONY: watch
watch: set-license fmt
	yarn watch

.PHONY: test
test: set-license fmt
	yarn test

.PHONY: tools
tools:
	yarn install
	go install github.com/sacloud/addlicense

.PHONY: clean
clean:
	rm -rf dist/

.PHONY: fmt
fmt:
	yarn format

.PHONY: set-license
set-license:
	@addlicense -c $(AUTHOR) -y $(COPYRIGHT_YEAR) $(COPYRIGHT_FILES)

