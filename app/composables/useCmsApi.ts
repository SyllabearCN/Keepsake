export function useCmsApi() {
  async function request<T>(
    url: string,
    options?: Parameters<typeof $fetch<T>>[1],
  ) {
    return await $fetch<T>(url, options)
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
