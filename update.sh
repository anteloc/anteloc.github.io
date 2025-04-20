#!/bin/bash

echo "INFO: Updating fusion-reader on anteloc.github.io"

to_delete=$(ls -1 | grep -vE 'update.sh|README.md|LICENSE|.git' | tr '\n' ' ')

echo "INFO: Deleting the following files: $to_delete"
rm -rf $to_delete

cp -r ../fusion-reader/dist/* .
git add . && git commit -m "auto updated" # && git push
