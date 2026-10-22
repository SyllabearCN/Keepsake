export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname
  if (path.startsWith('/api/cms/') && !path.startsWith('/api/cms/auth/')) {
    requireAdminSession(event)
  }
})
