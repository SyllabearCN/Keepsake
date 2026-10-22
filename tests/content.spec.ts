import { describe, expect, it } from 'vitest'
import { journeys } from '../app/data/journeys'
import { parseAlbumFolderName } from '../shared/albumFolder'

describe('Keepsake media rules', () => {
  it('parses album titles and upload dates', () => {
    expect(parseAlbumFolderName('西安旅行 2024-01-29')).toEqual({
      title: '西安旅行',
      date: '2024-01-29',
    })
    expect(parseAlbumFolderName('香港澳门行 2024-2-10')).toEqual({
      title: '香港澳门行',
      date: '2024-02-10',
    })
    expect(parseAlbumFolderName('banner')).toBeNull()
    expect(parseAlbumFolderName('相册名 2024/01/29')).toBeNull()
  })

  it('uses a Bilibili BV id for every journey', () => {
    expect(new Set(journeys.map(journey => journey.id)).size).toBe(journeys.length)
    for (const journey of journeys) {
      expect(journey.bvid).toMatch(/^BV/)
    }
  })
})
