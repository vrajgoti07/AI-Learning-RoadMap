from googleapiclient.discovery import build
from app.core.config import settings

def search_youtube_videos(query, max_results=3):
    if not settings.YOUTUBE_API_KEY or settings.YOUTUBE_API_KEY == "your_youtube_key_here":
        return []

    try:
        youtube = build('youtube', 'v3', developerKey=settings.YOUTUBE_API_KEY)
        
        request = youtube.search().list(
            q=f"{query} full tutorial course",
            part='snippet',
            type='video',
            videoDuration='medium', # Filters out Shorts (typically < 1 min)
            maxResults=max_results,
            relevanceLanguage='en'
        )
        response = request.execute()
        
        videos = []
        for item in response.get('items', []):
            videos.append({
                "id": item['id']['videoId'],
                "title": item['snippet']['title'],
                "thumbnail": item['snippet']['thumbnails']['medium']['url'],
                "link": f"https://www.youtube.com/watch?v={item['id']['videoId']}"
            })
        return videos
    except Exception as e:
        print(f"YouTube Search Error: {e}")
        return []
