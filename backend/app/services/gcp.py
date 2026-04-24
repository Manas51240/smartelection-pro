"""
Google Cloud Platform Integration Module.
Handles auxiliary Google Cloud services like Storage, Logging, and Translation.
"""
import os
import logging
from google.cloud import storage
from google.cloud import translate_v2 as translate
import google.cloud.logging

# Initialize Google Cloud Logging
try:
    client = google.cloud.logging.Client()
    client.setup_logging()
except Exception:
    # Fallback to standard logging if not running in GCP or credentials missing
    logging.basicConfig(level=logging.INFO)

logger = logging.getLogger("election-assistant")

def upload_to_cloud_storage(bucket_name: str, blob_name: str, content: str) -> bool:
    """
    Uploads a string content to Google Cloud Storage.
    
    Args:
        bucket_name (str): The name of the GCS bucket.
        blob_name (str): The destination file name in the bucket.
        content (str): The text content to upload.
        
    Returns:
        bool: True if upload was successful, False otherwise.
    """
    try:
        # Mock check for Hackathon without actual billing enabled
        if os.getenv("GCP_PROJECT_ID", "DUMMY") == "DUMMY":
            logger.info(f"[MOCK] Uploaded {blob_name} to GCS bucket {bucket_name}")
            return True
            
        storage_client = storage.Client()
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(blob_name)
        blob.upload_from_string(content)
        logger.info(f"Successfully uploaded {blob_name} to {bucket_name}.")
        return True
    except Exception as e:
        logger.error(f"Failed to upload to Cloud Storage: {e}")
        return False

def translate_text(target: str, text: str) -> str:
    """
    Translates text into the target language using Google Cloud Translation API.
    
    Args:
        target (str): Target language code (e.g., 'hi' for Hindi).
        text (str): The text to translate.
        
    Returns:
        str: The translated text.
    """
    try:
        if os.getenv("GCP_PROJECT_ID", "DUMMY") == "DUMMY":
            logger.info(f"[MOCK] Translated text to {target}")
            return f"[Translated to {target}] {text}"
            
        translate_client = translate.Client()
        result = translate_client.translate(text, target_language=target)
        return result["translatedText"]
    except Exception as e:
        logger.error(f"Translation failed: {e}")
        return text
