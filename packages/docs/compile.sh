#!/bin/bash

ignore=("shared" "lilybird")

for filename in diagrams/*.d2; do
    name="${filename:9:$((${#filename} - 12))}"
    if ! [[ "${ignore[*]}" =~ "$name" ]]
    then
        d2 $filename "src/assets/diagrams/${name}.svg"
    fi
done