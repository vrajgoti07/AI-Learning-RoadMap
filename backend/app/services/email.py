import aiosmtplib
from email.message import EmailMessage
from app.core.config import settings

async def send_welcome_email(to_email: str, name: str):
    """
    Sends a welcome email to the newly registered user.
    """
    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        print("SMTP credentials not configured. Skipping email send.")
        return False

    message = EmailMessage()
    message["From"] = f"{settings.FROM_NAME} <{settings.FROM_EMAIL}>"
    message["To"] = to_email
    message["Subject"] = "Welcome to PathFinder AI!"
    
    body = f"""
Hello {name},

Welcome to PathFinder AI! We are thrilled to have you join our system.

Get ready to generate personalized AI learning roadmaps and accelerate your career. 
Head over to your dashboard to create your very first roadmap today.

If you have any questions, feel free to reply to this email.

Best regards,
The PathFinder AI Team
"""
    message.set_content(body)

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USERNAME,
            password=settings.SMTP_PASSWORD,
            use_tls=False,
            start_tls=True,
        )
        return True
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")
        return False
