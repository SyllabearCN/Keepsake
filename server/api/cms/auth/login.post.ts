export default defineEventHandler(async (event) => {
  const body = await readBody<{ username?: string, password?: string }>(event)
  const username = body.username?.trim() || ''
  const password = body.password || ''

  await verifyAdminCredentials(event, username, password)
  createAdminSession(event, username)
  return { authenticated: true }
})
