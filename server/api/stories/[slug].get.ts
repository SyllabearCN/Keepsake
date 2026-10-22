import { getUniCloudStory } from '../../utils/unicloudContent'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug)
    throw createError({ statusCode: 400, statusMessage: 'Missing story slug' })

  const story = await getUniCloudStory(slug)
  if (!story)
    throw createError({ statusCode: 404, statusMessage: 'Story not found' })

  return story
})
