import type { AlbumRecord, StoryRecord, VideoRecord } from '../../../shared/cms'

export default defineEventHandler(async () => {
  const [albums, stories, videos, banners] = await Promise.all([
    listAllResource<AlbumRecord>('albums'),
    listAllResource<StoryRecord>('stories'),
    listAllResource<VideoRecord>('videos'),
    listAllResource('banners'),
  ])
  const photos = albums.reduce((total, album) => total + album.photos.length, 0)
  const records = [...albums, ...stories, ...videos]

  return {
    counts: {
      albums: albums.length,
      photos,
      stories: stories.length,
      videos: videos.length,
      banners: banners.length,
      published: records.filter(item => item.status === 'published').length,
      drafts: records.filter(item => item.status === 'draft').length,
    },
    recent: {
      albums: albums.slice(0, 4),
      stories: stories.slice(0, 4),
      videos: videos.slice(0, 3),
    },
    cloudConnected: Boolean(getUniCloudClient()),
  }
})
