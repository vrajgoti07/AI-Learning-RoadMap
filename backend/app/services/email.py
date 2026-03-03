import aiosmtplib

import os

from email.message import EmailMessage

from app.core.config import settings

from datetime import datetime


# Base URL for static assets (logo, etc.)
BASE_URL = "http://localhost:8000"
LOGO_URL = f"{BASE_URL}/static/logo.png"

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

            html_content = html_content.replace("{{name}}", name).replace("{{logo_url}}", LOGO_URL)

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

            html_content = html_content.replace("{{name}}", name).replace("{{otp}}", otp).replace("{{logo_url}}", LOGO_URL)

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
                                     .replace("{{year}}", year)\
                                     .replace("{{logo_url}}", LOGO_URL)

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
async def send_ban_email(email_to: str, name: str):
    """
    Sends a ban notification email to the user.
    """
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print(f"SMTP not configured. Skipping ban email to {email_to}")
        return

    message = EmailMessage()
    message["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
    message["To"] = email_to
    message["Subject"] = "Account Status Update - PathFinder AI"

    template_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "templates", "ban_email.html")
    try:
        with open(template_path, "r", encoding="utf-8") as file:
            html_content = file.read()
            html_content = html_content.replace("{{name}}", name).replace("{{logo_url}}", LOGO_URL)
    except Exception as e:
        print(f"Ban template not found, using fallback. Error: {e}")
        html_content = f"<html><body><h1>Account Suspension Notice</h1><p>Hi {name}, your account has been suspended.</p></body></html>"
    
    message.set_content(f"Hi {name},\nYour account has been suspended for violating our terms of service.")
    message.add_alternative(html_content, subtype="html")

    try:
        smtp_client = aiosmtplib.SMTP(hostname=settings.SMTP_HOST, port=settings.SMTP_PORT, use_tls=True)
        await smtp_client.connect()
        await smtp_client.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        await smtp_client.send_message(message)
        await smtp_client.quit()
        print(f"Ban email sent to {email_to}")
    except Exception as e:
        print(f"Failed to send ban email: {e}")

async def send_unban_email(email_to: str, name: str):
    """
    Sends an unban notification email to the user.
    """
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print(f"SMTP not configured. Skipping unban email to {email_to}")
        return

    message = EmailMessage()
    message["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
    message["To"] = email_to
    message["Subject"] = "Welcome Back! ✨ - PathFinder AI"

    template_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "templates", "unban_email.html")
    try:
        with open(template_path, "r", encoding="utf-8") as file:
            html_content = file.read()
            html_content = html_content.replace("{{name}}", name).replace("{{logo_url}}", LOGO_URL)
    except Exception as e:
        print(f"Unban template not found, using fallback. Error: {e}")
        html_content = f"<html><body><h1>Account Reinstated</h1><p>Hi {name}, your account has been reinstated.</p></body></html>"
    
    message.set_content(f"Hi {name},\nYour account has been reinstated. Welcome back!")
    message.add_alternative(html_content, subtype="html")

    try:
        smtp_client = aiosmtplib.SMTP(hostname=settings.SMTP_HOST, port=settings.SMTP_PORT, use_tls=True)
        await smtp_client.connect()
        await smtp_client.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        await smtp_client.send_message(message)
        await smtp_client.quit()
        print(f"Unban email sent to {email_to}")
    except Exception as e:
        print(f"Failed to send unban email: {e}")

async def send_ai_reply_email(email_to: str, subject: str, original_content: str, reply_content: str):
    """
    Sends an AI-generated reply to a user's email.
    """
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print(f"SMTP not configured. Skipping AI reply email to {email_to}")
        return

    message = EmailMessage()
    message["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
    message["To"] = email_to
    message["Subject"] = f"Re: {subject}"

    # We'll use a simple themed wrapper for AI replies
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Inter', sans-serif; background-color: #0b101e; color: #f8fafc; margin: 0; padding: 0; }}
            .container {{ max-width: 600px; margin: 40px auto; background-color: #131a2a; border-radius: 12px; overflow: hidden; border: 1px solid #263147; }}
            .header {{ background-color: #0b101e; padding: 20px; text-align: center; border-bottom: 1px solid #263147; }}
            .content {{ padding: 30px; }}
            .reply-text {{ white-space: pre-wrap; line-height: 1.6; color: #cbd5e1; font-size: 15px; }}
            .original-message {{ border-top: 1px solid #263147; margin-top: 30px; padding-top: 20px; color: #64748b; font-size: 13px; font-style: italic; }}
            .footer {{ background-color: #0b101e; padding: 20px; text-align: center; color: #475569; font-size: 11px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="{LOGO_URL}" alt="Logo" style="width: 40px; height: 40px; border-radius: 8px;">
            </div>
            <div class="content">
                <div class="reply-text">{reply_content}</div>
                <div class="original-message">
                    <strong>Original Message:</strong><br>
                    {original_content}
                </div>
            </div>
            <div class="footer">
                © {datetime.now().year} PathFinder AI Support. Powered by Gemini AI.
            </div>
        </div>
    </body>
    </html>
    """

    message.set_content(f"{reply_content}\n\n---\nOriginal Message:\n{original_content}")
    message.add_alternative(html_content, subtype="html")

    try:
        smtp_client = aiosmtplib.SMTP(hostname=settings.SMTP_HOST, port=settings.SMTP_PORT, use_tls=True)
        await smtp_client.connect()
        await smtp_client.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        await smtp_client.send_message(message)
        await smtp_client.quit()
        print(f"AI reply email sent to {email_to}")
    except Exception as e:
        print(f"Failed to send AI reply email: {e}")
