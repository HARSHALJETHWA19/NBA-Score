import boto3
import json
import os
import urllib.request

# Initialize S3 client
s3_client = boto3.client('s3')

def lambda_handler(event, context):
    # Get environment variables
    s3_bucket_name = os.getenv("S3_BUCKET_NAME")
    api_key = os.getenv("NBA_API_KEY")

    # Extract date from query parameters
    date = event.get("queryStringParameters", {}).get("date")
    if not date:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Date parameter is required"}),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"  # For CORS
            }
        }

    # Fetch NBA games data from the API
    api_url = f"https://api.sportsdata.io/v3/nba/scores/json/GamesByDate/{date}?key={api_key}"
    try:
        with urllib.request.urlopen(api_url) as response:
            games_data = json.loads(response.read().decode())
    except Exception as e:
        print(f"Error fetching data from API: {e}")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "Failed to fetch data"}),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        }

    # Save data to S3 with public-read access
    s3_key = f"nba-data/{date}.json"
    try:
        s3_client.put_object(
            Bucket=s3_bucket_name,
            Key=s3_key,
            Body=json.dumps(games_data),
            ContentType="application/json",
            ACL="public-read"  # Ensures public access to the file
        )

    except Exception as e:
        print(f"Error uploading data to S3: {e}")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "Failed to upload data to S3"}),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        }

    # Return the S3 object URL to the frontend
    s3_url = f"https://{s3_bucket_name}.s3.amazonaws.com/{s3_key}"
    return {
        "statusCode": 200,
        "body": json.dumps({"s3_url": s3_url}),
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        }
    }
