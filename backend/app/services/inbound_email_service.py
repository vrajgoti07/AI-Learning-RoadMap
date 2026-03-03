import imaplib
import email
from email.header import decode_header
import asyncio
import time
from app.core.config import settings
from app.services.ai_service import ai_service
from app.services.email import send_ai_reply_email

async def poll_inbound_emails():
    """
    Polls the IMAP server for unread emails and replies using AI.
    """
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD or not settings.IMAP_HOST:
        print("IMAP/SMTP not fully configured. Email poller disabled.")
        return

    print(f"Starting AI Email Poller for {settings.SMTP_USER}...")

    while True:
        try:
            # Connect to IMAP
            mail = imaplib.IMAP4_SSL(settings.IMAP_HOST, settings.IMAP_PORT)
            mail.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            mail.select("inbox")

            # Search for unread emails
            status, messages = mail.search(None, 'UNSEEN')
            if status != 'OK':
                await asyncio.sleep(60)
                continue

            for num in messages[0].split():
                # Fetch the email message
                status, data = mail.fetch(num, '(RFC822)')
                if status != 'OK': continue

                raw_email = data[0][1]
                msg = email.message_from_bytes(raw_email)

                # Extract Subject
                subject, encoding = decode_header(msg["Subject"])[0]
                if isinstance(subject, bytes):
                    subject = subject.decode(encoding if encoding else "utf-8")

                # Extract From
                from_ = msg.get("From")
                sender_email = email.utils.parseaddr(from_)[1]

                # Skip if it's from ourselves to avoid loops
                if sender_email.lower() == settings.SMTP_USER.lower():
                    continue

                # Extract Body
                body = ""
                if msg.is_multipart():
                    for part in msg.walk():
                        content_type = part.get_content_type()
                        content_disposition = str(part.get("Content-Disposition"))
                        if content_type == "text/plain" and "attachment" not in content_disposition:
                            body = part.get_payload(decode=True).decode()
                            break
                else:
                    body = msg.get_payload(decode=True).decode()

                if body:
                    print(f"Received email from {sender_email}: {subject}")
                    
                    # Generate AI Reply
                    ai_reply = await ai_service.generate_email_reply(body)
                    
                    # Send Reply
                    await send_ai_reply_email(sender_email, subject, body, ai_reply)
                    
                    # Mark as seen (imaplib handles this on fetch naturally if not specified otherwise, 
                    # but we ensure it's marked as seen)
                    mail.store(num, '+FLAGS', '\\Seen')

            mail.logout()
        except Exception as e:
            print(f"Error in email poller: {e}")
        
        # Wait for 1 minute before next poll
        await asyncio.sleep(60)

def start_email_poller(background_tasks):
    """
    Helper to start the poller.
    """
    asyncio.create_task(poll_inbound_emails())
