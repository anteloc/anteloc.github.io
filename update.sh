#!/bin/bash

echo "INFO: Updating fusion-reader on anteloc.github.io"
cp -r ../fusion-reader/dist/* .
git add . && git commit -m "auto updated" # && git push
