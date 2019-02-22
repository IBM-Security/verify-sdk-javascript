#!/bin/bash 

function help() {
    echo "./switch-between-relative-and-package [mode]"
    echo "mode = {relative, package}"
}

function main() {
    if [[ $1 = "relative" ]]; then
        sed -i '' -- 's/sdk-javascript/..\/..\/..\/dist/g' *.js
    elif [[ $1 = "package" ]]; then
        sed -i '' -- 's/..\/..\/..\/dist/sdk-javascript/g' *.js
    else
        help 
    fi
}

main $@