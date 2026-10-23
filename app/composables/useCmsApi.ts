import { callCmsCloud, getCmsSessionToken, uploadCmsFile } from '~/utils/cmsCloud'

interface RequestOptions {
  method?: string
  query?: Record<string, string | number | boolean | undefined>
  body?: unknown
}

export function useCmsApi() {
  async function request<T>(
    url: string,
    options: RequestOptions = {},
  ) {
    const method = (options.method || 'GET').toUpperCase()
    const pathname = new URL(url, 'http://localhost').pathname
    const body = options.body && typeof options.body === 'object'
      ? options.body as Record<string, unknown>
      : {}

    if (pathname === '/api/cms/auth/session') {
      if (!getCmsSessionToken()) {
        return {
          authenticated: false,
          configured: Boolean(useRuntimeConfig().public.unicloud.spaceId),
          username: null,
        } as T
      }
      return await callCmsCloud<T>('session')
    }

    if (pathname === '/api/cms/auth/login' && method === 'POST') {
      return await callCmsCloud<T>('login', {
        username: body.username,
        password: body.password,
      }, false)
    }

    if (pathname === '/api/cms/auth/logout' && method === 'POST') {
      return await callCmsCloud<T>('logout')
    }

    if (pathname === '/api/cms/dashboard') {
      return await callCmsCloud<T>('dashboard')
    }

    const resourceMatch = pathname.match(/^\/api\/cms\/resources\/(albums|stories|videos|banners)(?:\/([^/]+))?$/)
    if (resourceMatch) {
      const [, resource, id] = resourceMatch
      if (id) {
        if (method === 'PUT') {
          return await callCmsCloud<T>('update', { resource, id, data: body })
        }
        if (method === 'DELETE') {
          const record = await callCmsCloud<Record<string, unknown>>('get', { resource, id })
          return await callCmsCloud<T>('delete', { resource, id, data: record })
        }
        return await callCmsCloud<T>('get', { resource, id })
      }
      if (method === 'POST') {
        return await callCmsCloud<T>('create', { resource, data: body })
      }
      return await callCmsCloud<T>('list', {
        resource,
        query: options.query || {},
      })
    }

    if (pathname === '/api/cms/upload') {
      if (!(options.body instanceof FormData)) {
        throw new Error('缺少需要上传的图片。')
      }
      const file = options.body.get('file')
      if (!(file instanceof File)) {
        throw new Error('缺少需要上传的图片。')
      }
      return await uploadCmsFile(
        file,
        String(options.query?.usage || 'albums'),
        typeof options.query?.cloudPath === 'string' ? options.query.cloudPath : undefined,
      ) as T
    }

    return await $fetch<T>(url, options as Parameters<typeof $fetch<T>>[1])
  }

  function errorMessage(error: unknown) {
    const value = error as {
      data?: { message?: string, statusMessage?: string }
      statusMessage?: string
      message?: string
    }
    return value?.data?.message
      || value?.data?.statusMessage
      || value?.statusMessage
      || value?.message
      || '操作失败，请稍后重试。'
  }

  return { request, errorMessage }
}
