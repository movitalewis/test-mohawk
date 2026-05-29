#!/bin/bash

#################################################################################################################
# Asad Siddiqui (asad_siddiqui@mohawkind.com)
# This script is written to be executed after a new Version of App Engine Service is Deployed
# This cleans up the previous versions that have been deployed to app engine
##################################################################################################################

## Make sure the Project ID these commands are executed against is set 
## Project ID is passed in as a command line parameter to this script 
echo "Project ID: $1"
echo "Setting up the project ..."
echo "gcloud config set project $1"
gcloud config set project "$1"

echo "Deleting older versions of the app ..."
versions=$(gcloud app versions list \
  --service default \
  --sort-by '~VERSION.ID' \
  --format 'value(VERSION.ID)' | sed 1,4d)
for version in $versions; do
  gcloud app versions delete "$version" \
    --service default \
    --quiet
done