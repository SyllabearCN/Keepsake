import type { ListResponse, ResourceName, ResourceRecord } from '#shared/cms'

export function useCmsResourceList<T extends ResourceRecord>(
  resource: ResourceName,
  initialPageSize = 8,
) {
  const { request, errorMessage } = useCmsApi()
  const items = ref<T[]>([]) as Ref<T[]>
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(initialPageSize)
  const search = ref('')
  const status = ref('all')
  const loading = ref(false)
  const error = ref('')

  async function load() {
    loading.value = true
    error.value = ''
    try {
      const response = await request<ListResponse<T>>(`/api/cms/resources/${resource}`, {
        query: {
          search: search.value,
          status: status.value,
          page: page.value,
          pageSize: pageSize.value,
        },
      })
      items.value = response.items
      total.value = response.total
    }
    catch (cause) {
      error.value = errorMessage(cause)
    }
    finally {
      loading.value = false
    }
  }

  function applyFilters() {
    page.value = 1
    void load()
  }

  function changePage(nextPage: number, nextPageSize: number) {
    page.value = nextPage
    pageSize.value = nextPageSize
    void load()
  }

  watch(status, applyFilters)
  onMounted(load)

  return {
    items,
    total,
    page,
    pageSize,
    search,
    status,
    loading,
    error,
    load,
    applyFilters,
    changePage,
  }
}
