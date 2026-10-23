<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import { ensureCmsAntd } from '~/utils/ensureCmsAntd'

await ensureCmsAntd()

const cmsTheme = {
  token: {
    colorPrimary: '#17644f',
    colorText: '#1d2f29',
    colorTextSecondary: '#68766f',
    colorBorder: '#e8e4da',
    colorBgContainer: '#fffdf8',
    borderRadius: 12,
    fontFamily: '"Avenir Next", "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
  },
}
</script>

<template>
  <ClientOnly>
    <AConfigProvider
      :locale="zhCN"
      :theme="cmsTheme"
    >
      <main class="auth-layout">
        <slot />
      </main>
    </AConfigProvider>
  </ClientOnly>
</template>

<style src="~/assets/css/cms.css"></style>
