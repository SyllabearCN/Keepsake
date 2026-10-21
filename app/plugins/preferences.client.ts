export default defineNuxtPlugin(() => {
  const preferences = usePreferencesStore()
  preferences.syncTheme()
})
