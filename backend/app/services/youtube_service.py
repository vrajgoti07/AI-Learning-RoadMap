from googleapiclient.discovery import build
from app.core.config import settings

def search_youtube_channels(query, max_results=5):
    if not settings.YOUTUBE_API_KEY or settings.YOUTUBE_API_KEY == "your_youtube_key_here":
        return []

    try:
        youtube = build('youtube', 'v3', developerKey=settings.YOUTUBE_API_KEY)
        
        request = youtube.search().list(
            q=f"{query} course",
            part='snippet',
            type='channel',
            maxResults=max_results,
            relevanceLanguage='en'
        )
        response = request.execute()
        
        channels = []
        for item in response.get('items', []):
            channel_id = item['id'].get('channelId')
            if channel_id:
                channels.append({
                    "id": channel_id,
                    "title": item['snippet']['title'],
                    "thumbnail": item['snippet']['thumbnails']['medium']['url'],
                    "link": f"https://www.youtube.com/channel/{channel_id}"
                })
        return channels
    except Exception as e:
        print(f"YouTube Channel Search Error: {e}")
        return []
