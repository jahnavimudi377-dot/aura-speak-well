# Admin Guide: Managing Content

This folder contains JSON files that control the content displayed in the app. You can edit these files directly through GitHub to update songs and videos.

## Updating the Calming Playlist (`playlist.json`)

Edit `playlist.json` to add, remove, or modify songs in the calming playlist.

### Song Object Structure:
```json
{
  "id": "unique-id",
  "title": "Song Title",
  "artist": "Artist Name",
  "type": "youtube",
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "embedId": "VIDEO_ID",
  "thumbnail": "https://img.youtube.com/vi/VIDEO_ID/hqdefault.jpg",
  "duration": "MM:SS or HH:MM:SS"
}
```

### How to get YouTube video details:
1. **Video ID**: From `https://www.youtube.com/watch?v=UfcAVejslrU`, the ID is `UfcAVejslrU`
2. **Thumbnail**: Use `https://img.youtube.com/vi/VIDEO_ID/hqdefault.jpg` or `maxresdefault.jpg` for higher quality
3. **Duration**: View on YouTube or use approximate time

## Updating Motivational Videos (`videos.json`)

Edit `videos.json` to add, remove, or modify motivational videos.

### Video Object Structure:
```json
{
  "id": "unique-id",
  "title": "Video Title",
  "description": "Brief description of the video content",
  "embedId": "VIDEO_ID",
  "thumbnail": "https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg",
  "duration": "MM:SS",
  "category": "Category Name"
}
```

### Available Categories:
- Motivation
- Mindfulness
- Personal Growth
- Happiness
- Mental Health
- Positivity
- (You can add new categories as needed)

## Steps to Update via GitHub:

1. Navigate to your GitHub repository
2. Go to `public/data/`
3. Click on the file you want to edit (`playlist.json` or `videos.json`)
4. Click the pencil icon (Edit this file)
5. Make your changes following the JSON structure
6. Scroll down and commit your changes
7. The changes will be live after the next deployment

## Important Notes:

- **Valid JSON**: Make sure your JSON is valid (use a JSON validator if needed)
- **Unique IDs**: Each entry must have a unique ID
- **Commas**: Don't forget commas between objects, but no comma after the last object
- **Quotes**: Use double quotes for all strings
- **YouTube Links**: Use public YouTube videos that allow embedding

## Example of adding a new song:

```json
[
  {
    "id": "1",
    "title": "Existing Song",
    ...
  },
  {
    "id": "7",
    "title": "New Relaxing Track",
    "artist": "Calm Sounds",
    "type": "youtube",
    "url": "https://www.youtube.com/watch?v=NEW_VIDEO_ID",
    "embedId": "NEW_VIDEO_ID",
    "thumbnail": "https://img.youtube.com/vi/NEW_VIDEO_ID/hqdefault.jpg",
    "duration": "15:00"
  }
]
```

## Testing Your Changes:

After committing changes to GitHub:
1. Wait for deployment to complete
2. Visit your app
3. Navigate to Playlist or Videos section
4. Verify your changes appear correctly
5. Test that videos/songs play properly

## Troubleshooting:

- **Content not updating**: Clear browser cache and refresh
- **Videos not playing**: Ensure the YouTube video allows embedding
- **Broken layout**: Check JSON syntax for missing commas or quotes
- **Thumbnails not loading**: Try using `maxresdefault.jpg` instead of `hqdefault.jpg`
