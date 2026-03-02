import asyncio
import sys
import os

# Add the parent directory to sys.path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.email import send_newsletter_bulk

async def main():
    if len(sys.argv) < 3:
        print("Usage: python send_newsletter.py \"Subject\" \"Content (HTML or Text)\"")
        return

    subject = sys.argv[1]
    content = sys.argv[2]

    print(f"🚀 Starting newsletter broadcast: {subject}")
    count = await send_newsletter_bulk(subject, content)
    print(f"✅ Broadcast finished. Sent to {count} subscribers.")

if __name__ == "__main__":
    asyncio.run(main())
