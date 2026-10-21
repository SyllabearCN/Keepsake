import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    stories: defineCollection({
      type: 'page',
      source: 'stories/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.string(),
        category: z.string(),
        cover: z.string(),
        location: z.string().optional(),
        readingTime: z.number().optional(),
      }),
    }),
  },
})
