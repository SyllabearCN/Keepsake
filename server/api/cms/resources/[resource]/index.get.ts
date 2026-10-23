import type { ResourceName } from '#shared/cms'

export default defineEventHandler(async (event) => {
  const resource = parseResource(getRouterParam(event, 'resource')) as ResourceName
  const query = getQuery(event)
  return listResource(resource, {
    search: typeof query.search === 'string' ? query.search : '',
    enabled: typeof query.enabled === 'string' ? query.enabled : '',
    page: Number(query.page) || 1,
    pageSize: Number(query.pageSize) || 10,
  })
})
