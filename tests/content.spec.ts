import { describe, expect, it } from 'vitest'
import { albums, gallery } from '../app/data/albums'
import { journeys } from '../app/data/journeys'

describe('Keepsake content indexes', () => {
  it('uses unique photo and video ids', () => {
    expect(new Set(gallery.map(photo => photo.id)).size).toBe(gallery.length)
    expect(new Set(journeys.map(journey => journey.id)).size).toBe(journeys.length)
  })

  it('keeps every photo linked to a declared album', () => {
    const albumIds = new Set(albums.map(album => album.id))

    for (const photo of gallery) {
      expect(albumIds.has(photo.album)).toBe(true)
    }
  })

  it('uses a Bilibili BV id for every journey', () => {
    for (const journey of journeys) {
      expect(journey.bvid).toMatch(/^BV/)
    }
  })
})
