import boto3
from app.core.config import settings

def r2_client():
    return boto3.client(
        "s3",
        endpoint_url=settings.r2_endpoint,
        aws_access_key_id=settings.r2_access_key_id,
        aws_secret_access_key=settings.r2_secret_access_key,
        region_name="auto",
    )

def upload_bytes(key: str, data: bytes, content_type: str) -> str:
    s3 = r2_client()
    s3.put_object(
        Bucket=settings.r2_bucket,
        Key=key,
        Body=data,
        ContentType=content_type,
        ACL="public-read",
    )
    return f"{settings.r2_public_base_url.rstrip('/')}/{key}"