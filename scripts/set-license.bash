#!/bin/bash

addlicense -l agpl -c "The UsaCon Authors" -y "2020" \
$( \
    find . \( -name "*.ts" -or -name "*.tsx" -or -name "*.js" -or -name "*.jsx" -or -name "*.css" -or -name "*.html" -or -name "*.go" \) -print | \
    grep -v "/vendor/" | \
    grep -v "/dist/" | \
    grep -v "/node_modules" \
)