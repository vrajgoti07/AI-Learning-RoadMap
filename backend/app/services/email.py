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



async def send_password_reset_email(email_to: str, name: str, otp: str = None):

    """

    Sends a password reset email to the user.

    """

    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:

        print(f"SMTP not configured. Skipping password reset email to {email_to}")

        return



    message = EmailMessage()

    message["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"

    message["To"] = email_to

    message["Subject"] = "Password Reset OTP - PathFinder AI"



    # Load HTML template from file

    template_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "templates", "reset_password_email.html")

    try:

        with open(template_path, "r", encoding="utf-8") as file:

            html_content = file.read()

            html_content = html_content.replace("{{name}}", name).replace("{{otp}}", otp)

    except Exception as e:
        print(f"Template not found, using fallback. Error: {e}")
        # Fallback inline HTML
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                <h2 style="color: #4F46E5; text-align: center;">Reset Your Password</h2>
                <p>Hi {name},</p>
                <p>We received a request to reset your password for your PathFinder AI account.</p>
                <p>To reset your password, please use the following OTP:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="background-color: #f3f4f6; color: #1f2937; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 24px; letter-spacing: 4px; display: inline-block;">{otp}</span>
                </div>
                <p>If you did not request a password reset, please ignore this email.</p>
                <p>Happy Learning!<br>The PathFinder AI Team</p>
            </div>
        </body>
        </html>
        """
    
    message.set_content(
        f"Hi {name},\nWe received a request to reset your password. "
        f"Please use the following OTP to reset it: {otp}\n\n"
        f"If you did not request this, please ignore this email.\n\n"
        f"Happy Learning!\n- The PathFinder AI Team"
    )
    message.add_alternative(html_content, subtype="html")

    try:
        smtp_client = aiosmtplib.SMTP(
            hostname=settings.SMTP_HOST, 
            port=settings.SMTP_PORT, 
            use_tls=True
        )
        await smtp_client.connect()
        await smtp_client.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        await smtp_client.send_message(message)
        await smtp_client.quit()
        print(f"Password reset email sent successfully to {email_to}")
    except Exception as e:
        print(f"Failed to send password reset email to {email_to}. Error: {e}")
async def send_newsletter_bulk(subject: str, content: str):
    """
    Sends a newsletter email to all subscribers in the database.
    """
    from app.database.connection import newsletters_collection
    
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print("SMTP not configured. Skipping newsletter broadcast.")
        return 0

    subscribers = await newsletters_collection.find({}, {"email": 1}).to_list(length=None)
    if not subscribers:
        print("No subscribers found.")
        return 0

    template_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "templates", "newsletter_template.html")
    try:
        with open(template_path, "r", encoding="utf-8") as file:
            template_html = file.read()
    except Exception as e:
        print(f"Newsletter template not found: {e}")
        template_html = "<html><body><h1>{{subject}}</h1><div>{{content}}</div></body></html>"

    year = str(datetime.now().year)
    success_count = 0
    
    smtp_client = aiosmtplib.SMTP(
        hostname=settings.SMTP_HOST, 
        port=settings.SMTP_PORT, 
        use_tls=True
    )
    
    try:
        await smtp_client.connect()
        await smtp_client.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        
        for sub in subscribers:
            email_to = sub["email"]
            message = EmailMessage()
            message["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
            message["To"] = email_to
            message["Subject"] = subject

            # Prepare HTML content
            final_html = template_html.replace("{{subject}}", subject)\
                                     .replace("{{content}}", content)\
                                     .replace("{{year}}", year)

            message.set_content(f"{subject}\n\n{content}")
            message.add_alternative(final_html, subtype="html")
            
            try:
                await smtp_client.send_message(message)
                success_count += 1
                print(f"Newsletter sent to {email_to}")
            except Exception as e:
                print(f"Failed to send newsletter to {email_to}: {e}")

        await smtp_client.quit()
    except Exception as e:
        print(f"SMTP Error during broadcast: {e}")
    
    return success_count

from datetime import datetime
