import type { ResourceName } from '../../../../../shared/cms'

export default defineEventHandler(async (event) => {
  const resource = parseResource(getRouterParam(event, 'resource')) as ResourceName
  const body = await readBody<Record<string, unknown>>(event)
  return createResource(resource, body)
})
