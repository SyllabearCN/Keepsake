export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/cms/login' || to.path === '/cms/login/') {
    return
  }

  const { request } = useCmsApi()
  try {
    const session = await request<{ authenticated: boolean }>('/api/cms/auth/session')
    if (!session.authenticated) {
      return navigateTo(`/cms/login?redirect=${encodeURIComponent(to.fullPath)}`)
    }
  }
  catch {
    return navigateTo('/cms/login')
  }
})
