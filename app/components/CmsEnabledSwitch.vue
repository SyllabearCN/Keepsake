<script setup lang="ts">
import { message } from 'ant-design-vue'
import type { AlbumRecord, StoryRecord, VideoRecord } from '#shared/cms'

const props = defineProps<{
  resource: 'albums' | 'stories' | 'videos'
  record: AlbumRecord | StoryRecord | VideoRecord
}>()

const { request, errorMessage } = useCmsApi()
const pending = ref(false)

async function update(checked: boolean) {
  const previous = props.record.enabled
  props.record.enabled = checked
  pending.value = true
  try {
    await request(`/api/cms/resources/${props.resource}/${props.record._id}`, {
      method: 'PUT',
      body: {
        ...props.record,
        enabled: checked,
      },
    })
    message.success(checked ? '已启用' : '已停用')
  }
  catch (cause) {
    props.record.enabled = previous
    message.error(errorMessage(cause))
  }
  finally {
    pending.value = false
  }
}

function change(checked: boolean) {
  void update(checked)
}
</script>

<template>
  <a-switch
    :checked="record.enabled !== false"
    :loading="pending"
    size="small"
    @change="change"
  />
</template>
