export default defineEventHandler((event) => {
  const session = getAdminSession(event)
  const config = useRuntimeConfig(event).cms
  return {
    authenticated: Boolean(session),
    configured: Boolean(config.sessionSecret && config.passwordPepper && getUniCloudClient()),
    username: session?.username ?? null,
  }
})
