let loading: Promise<void> | undefined

export function ensureCmsAntd() {
  if (!import.meta.client)
    return Promise.resolve()

  const app = useNuxtApp().vueApp
  if (app.component('AButton'))
    return Promise.resolve()

  loading ??= import('ant-design-vue').then(({ default: Antd }) => {
    if (!app.component('AButton'))
      app.use(Antd)
  })

  return loading
}
