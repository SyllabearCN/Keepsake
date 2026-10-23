export default defineNuxtPlugin(async (nuxtApp) => {
  if (!useRoute().path.startsWith('/cms'))
    return
  const { default: Antd } = await import('ant-design-vue')
  nuxtApp.vueApp.use(Antd)
})
