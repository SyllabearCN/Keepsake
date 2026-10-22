import { getUniCloudContent } from '../../utils/unicloudContent'

export default defineEventHandler(async () => {
  const content = await getUniCloudContent()
  return content.manifest
})
