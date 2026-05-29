#!/bin/bash

#################################################################################################################
# Migration Script: App Engine → Cloud Run
# This script switches your existing Load Balancer (ae-url-map) from App Engine to Cloud Run
#
# Prerequisites:
# 1. Cloud Run service must be deployed first (run cloudbuild-cloudrun.yaml)
# 2. Artifact Registry repository must exist
#
# Run this ONCE after your first Cloud Run deployment
#################################################################################################################

set -e

# Configuration
PROJECT_ID="${1:-fna-ui-mx-dev-mhk}"
REGION="us-central1"
SERVICE_NAME="fna-ui-xchange-ssr"

# Existing Load Balancer resources
BACKEND_SERVICE="ae-backend-service"
OLD_NEG="ae-neg"
NEW_NEG="cloudrun-neg"

echo "============================================"
echo "Migration: App Engine → Cloud Run"
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "============================================"

# Set project
gcloud config set project "$PROJECT_ID"

# Step 1: Create Artifact Registry (if not exists)
echo ""
echo "Step 1: Checking Artifact Registry..."
if ! gcloud artifacts repositories describe angular-ssr-repo --location="$REGION" &>/dev/null; then
    echo "Creating Artifact Registry repository..."
    gcloud artifacts repositories create angular-ssr-repo \
        --repository-format=docker \
        --location="$REGION" \
        --description="Angular SSR Docker images"
else
    echo "Artifact Registry already exists."
fi

# Step 2: Check if Cloud Run service exists
echo ""
echo "Step 2: Verifying Cloud Run service..."
if ! gcloud run services describe "$SERVICE_NAME" --region="$REGION" &>/dev/null; then
    echo "ERROR: Cloud Run service '$SERVICE_NAME' not found."
    echo "Please deploy Cloud Run first using cloudbuild-cloudrun.yaml"
    exit 1
fi
echo "Cloud Run service found: $SERVICE_NAME"

# Step 3: Create new NEG for Cloud Run
echo ""
echo "Step 3: Creating Cloud Run NEG..."
if gcloud compute network-endpoint-groups describe "$NEW_NEG" --region="$REGION" &>/dev/null; then
    echo "Cloud Run NEG already exists."
else
    gcloud compute network-endpoint-groups create "$NEW_NEG" \
        --region="$REGION" \
        --network-endpoint-type=serverless \
        --cloud-run-service="$SERVICE_NAME"
    echo "Cloud Run NEG created."
fi

# Step 4: Add Cloud Run NEG to backend service
echo ""
echo "Step 4: Adding Cloud Run backend..."
gcloud compute backend-services add-backend "$BACKEND_SERVICE" \
    --global \
    --network-endpoint-group="$NEW_NEG" \
    --network-endpoint-group-region="$REGION" \
    --quiet || echo "Backend may already be added."

# Step 5: Remove App Engine NEG from backend service
echo ""
echo "Step 5: Removing App Engine backend..."
gcloud compute backend-services remove-backend "$BACKEND_SERVICE" \
    --global \
    --network-endpoint-group="$OLD_NEG" \
    --network-endpoint-group-region="$REGION" \
    --quiet || echo "App Engine backend may already be removed."

# Step 6: Delete old App Engine NEG (optional)
echo ""
echo "Step 6: Cleaning up old App Engine NEG..."
read -p "Delete old App Engine NEG '$OLD_NEG'? (y/N): " confirm
if [[ "$confirm" =~ ^[Yy]$ ]]; then
    gcloud compute network-endpoint-groups delete "$OLD_NEG" \
        --region="$REGION" \
        --quiet || echo "Could not delete old NEG."
    echo "Old NEG deleted."
else
    echo "Skipping NEG deletion. You can delete it later manually."
fi

# Step 7: Verify configuration
echo ""
echo "============================================"
echo "Migration Complete!"
echo "============================================"
echo ""
echo "Backend Service Configuration:"
gcloud compute backend-services describe "$BACKEND_SERVICE" --global --format="yaml(backends)"

echo ""
echo "Load Balancer URL Map:"
gcloud compute url-maps describe ae-url-map --format="yaml(defaultService)"

echo ""
echo "Cloud Run Service URL:"
gcloud run services describe "$SERVICE_NAME" --region="$REGION" --format='value(status.url)'

echo ""
echo "============================================"
echo "Next Steps:"
echo "1. Test your application via the Load Balancer IP"
echo "2. Disable/delete App Engine service if no longer needed:"
echo "   gcloud app services delete default --project=$PROJECT_ID"
echo "3. Update Cloud Build trigger to use cloudbuild-cloudrun.yaml"
echo "============================================"
