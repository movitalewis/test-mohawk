#!/bin/bash

#################################################################################################################
# Asad Siddiqui (asad_siddiqui@mohawkind.com)
# This script is written to be executed after a new Version of App Engine Service is Deployed
# This is integrated with Cloudbuild and a Cloud Build step calls this
# It creates IP Addresses and then ties the Load Balancer in GCP with the IP Address
# This has logic to not recreate resources. 
# Commented out script at the bottom to delete the infrastructure this script creates
##################################################################################################################

## Make sure the Project ID these commands are executed against is set 
## Project ID is passed in as a command line parameter to this script 
echo "Project ID: $1"
echo "Setting up the project ..."
echo "gcloud config set project $1"
gcloud config set project "$1"

### Check if IP Address has been reserved in the project.
### set up a flag (ip_found) to indicate if the IP Exists or not. Skip Creation of resources if IP is found
gcloud compute addresses list --filter=name='lb-dev-ip' > builds.txt
ip_found=false
while read -r line; do
    if grep -q "Listed 0 items" <<< "$line"; then
       ip_found=false       
    else
       ip_found=true
    fi
done < builds.txt
if [ "$ip_found" = true ] ; then
    echo 'IP Address Already found. Skipping Load Balancer Set Up'
else
    echo 'IP Address Not found. Creating ...'
    gcloud compute addresses create lb-dev-ip --network-tier=PREMIUM --ip-version=IPV4 --global --quiet
    echo 'Creating NEG ...'
    gcloud compute network-endpoint-groups create ae-neg --region=us-central1 --network-endpoint-type=serverless --app-engine-service=default --quiet
    echo 'Creating backend service ...'
    gcloud compute backend-services create ae-backend-service --load-balancing-scheme=EXTERNAL --global --quiet
    echo 'Adding backend service and neg ...'
    gcloud compute backend-services add-backend ae-backend-service --global --network-endpoint-group=ae-neg --network-endpoint-group-region=us-central1 --quiet
    echo 'Creating url maps ...'
    gcloud compute url-maps create ae-url-map --default-service ae-backend-service --quiet
    echo 'Creating target proxy ...'
    gcloud compute target-http-proxies create ae-target-proxy --url-map=ae-url-map --quiet
fi
if [ "$ip_found" = false ] ; then
    ### Look up the IP Address so we can create a forwarding rule for load balancer
    IPAdd="empty"
    echo 'Creating forwarding rule with the ip ...'
    gcloud compute addresses list --filter=name='lb-dev-ip' > devip.txt
    IPAdd=$(grep -E '[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}' devip.txt)
    echo "$IPAdd"
    IFS=': ' read -ra IP <<< "$IPAdd"
    echo "${IP[1]}" 
    echo 'Creating forwarding rule FOR LOAD BALANCER ...'
    gcloud compute forwarding-rules create ae-forwarding-rule --load-balancing-scheme=EXTERNAL --network-tier=PREMIUM --address="${IP[1]}" --target-http-proxy=ae-target-proxy --global --ports=80
else
    echo "Skipping forwarding rule ..."    
fi

# Set up Load Balancer
# HTTP for testing
# gcloud compute addresses create lb-dev-ip --network-tier=PREMIUM --ip-version=IPV4 --global
# gcloud compute network-endpoint-groups create ssrivc-neg --region=us-central1 --network-endpoint-type=serverless --app-engine-service=test-new-dev 
# gcloud compute backend-services create ssrivc-backend-service --load-balancing-scheme=EXTERNAL --global
# gcloud compute backend-services add-backend ssrivc-backend-service --global --network-endpoint-group=ssrivc-neg --network-endpoint-group-region=us-central1
# gcloud compute url-maps create ssrivc-url-map --default-service ssrivc-backend-service
# gcloud compute target-http-proxies create ssrivc-target-proxy --url-map=ssrivc-url-map
# gcloud compute forwarding-rules create ae-forwarding-rule --load-balancing-scheme=EXTERNAL --network-tier=PREMIUM --address=35.186.229.171 --target-http-proxy=ssrivc-target-proxy --global --ports=80

# Script to delete

# gcloud compute forwarding-rules delete ae-forwarding-rule --global --quiet
# gcloud compute target-http-proxies delete ae-target-proxy --quiet
# gcloud compute url-maps delete ae-url-map --quiet
# gcloud compute backend-services delete ae-backend-service --global --quiet
# gcloud compute network-endpoint-groups delete ae-neg --region=us-central1 --quiet
# gcloud compute addresses delete lb-dev-ip --global --quiet
