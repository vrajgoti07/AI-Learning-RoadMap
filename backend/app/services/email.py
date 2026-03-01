import aiosmtplib
import os
from email.message import EmailMessage
from app.core.config import settings

async def send_welcome_email(email_to: str, name: str):
    """
    Sends a welcome email to the newly registered user.
    Uses SMTP details configured in the environment variables.
    """
    # If SMTP settings are not configured properly, log and exit early
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print(f"SMTP not configured. Skipping welcome email to {email_to}")
        return

    # Construct the email message
    message = EmailMessage()
    message["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
    message["To"] = email_to
    message["Subject"] = "Welcome to AI Learning Roadmap! 🚀"

    # Load HTML template from file
    template_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "templates", "welcome_email.html")
    try:
        with open(template_path, "r", encoding="utf-8") as file:
            html_content = file.read()
            html_content = html_content.replace("{{name}}", name)
    except Exception as e:
        print(f"Template not found, using fallback. Error: {e}")
        # Fallback inline HTML if the file is missing
        html_content = f"<html><body><h1>Welcome to AI Learning Roadmap!</h1><p>Hi {name}, we're glad you're here.</p></body></html>"

    
    # Fallback plain text for email clients that do not support HTML
    message.set_content(
        f"Hi {name},\n\nWelcome to AI Learning Roadmap! We are thrilled to have you here. "
        f"Get started by logging into your dashboard.\n\nHappy Learning! 🚀\n- The AI Learning Roadmap Team"
    )
    message.add_alternative(html_content, subtype="html")

    try:
        # Use SSL connection to the SMTP server (for port 465)
        smtp_client = aiosmtplib.SMTP(
            hostname=settings.SMTP_HOST, 
            port=settings.SMTP_PORT, 
            use_tls=True
        )
        await smtp_client.connect()
        await smtp_client.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        await smtp_client.send_message(message)
        await smtp_client.quit()
        print(f"Welcome email sent successfully to {email_to}")
    except Exception as e:
        print(f"Failed to send welcome email to {email_to}. Error: {e}")
