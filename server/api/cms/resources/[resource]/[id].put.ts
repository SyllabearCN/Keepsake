import type { ResourceName } from '#shared/cms'

export default defineEventHandler(async (event) => {
  const resource = parseResource(getRouterParam(event, 'resource')) as ResourceName
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  const body = await readBody<Record<string, unknown>>(event)
  return updateResource(resource, id, body)
})
