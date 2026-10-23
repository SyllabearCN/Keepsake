import tailwindcss from '@tailwindcss/vite'

const publicUniCloudConfig = {
  spaceId: 'mp-174d4239-a43e-4e0a-9fdc-92547241a10b',
  clientSecret: 'MdsJBD4BwpneNRkhLRf56A==',
  endpoint: 'https://api.next.bspapp.com',
}

export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxt/image',
    '@nuxtjs/i18n',
    '@pinia/nuxt',
    '@vite-pwa/nuxt',
    '@nuxt/icon',
    '@nuxt/eslint',
  ],
  ssr: true,
  devtools: { enabled: true },

  app: {
    head: {
      titleTemplate: '%s · 纪念日',
      title: '我们仨的家庭记忆簿',
      htmlAttrs: { lang: 'zh-CN' },
      meta: [
        {
          name: 'description',
          content: '把旅行、日常和文字，慢慢收进属于我们一家人的纪念日。',
        },
        { name: 'theme-color', content: '#173b33' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: '纪念日' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: '纪念日 · 我们仨' },
        {
          property: 'og:description',
          content: '一个装满旅行、照片和故事的家庭记忆簿。',
        },
        {
          property: 'og:image',
          content: 'https://mp-174d4239-a43e-4e0a-9fdc-92547241a10b.cdn.bspapp.com/keepsake/banner/202607180001.jpg',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/icons/favicon.svg' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/icons/apple-touch-icon.png' },
      ],
      script: [
        {
          key: 'keepsake-theme',
          innerHTML:
            'try{const t=localStorage.getItem(\'keepsake-theme\');document.documentElement.dataset.theme=t===\'dark\'||(t===null&&matchMedia(\'(prefers-color-scheme: dark)\').matches)?\'dark\':\'light\'}catch(e){document.documentElement.dataset.theme=\'light\'}',
        },
      ],
    },
    pageTransition: {
      name: 'page',
      mode: 'out-in',
    },
  },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      unicloud: {
        spaceId: process.env.NUXT_UNICLOUD_SPACE_ID || publicUniCloudConfig.spaceId,
        clientSecret: process.env.NUXT_UNICLOUD_CLIENT_SECRET || publicUniCloudConfig.clientSecret,
        endpoint: process.env.NUXT_UNICLOUD_ENDPOINT || publicUniCloudConfig.endpoint,
      },
    },
    unicloud: {
      spaceId: '',
      clientSecret: '',
      endpoint: 'https://api.next.bspapp.com',
    },
    cms: {
      sessionSecret: '',
      passwordPepper: '',
      cloudSecret: '',
    },
  },
  devServer: {
    host: '0.0.0.0',
    port: 3200,
  },
  compatibilityDate: '2026-10-21',

  routeRules: {
    '/': { swr: 60 },
    '/api/home': { swr: 60 },
  },

  nitro: {
    externals: {
      traceInclude: ['node_modules/@dcloudio/uni-cloud/dist/uni-cloud.cjs.js'],
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
  telemetry: false,

  eslint: {
    config: {
      stylistic: true,
    },
  },

  i18n: {
    defaultLocale: 'zh-CN',
    strategy: 'no_prefix',
    langDir: 'locales',
    locales: [
      { code: 'zh-CN', name: '中文', file: 'zh-CN.json' },
      { code: 'en', name: 'English', file: 'en.json' },
    ],
    detectBrowserLanguage: false,
  },

  image: {
    quality: 82,
    format: ['webp'],
    densities: [1],
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      id: '/',
      name: '纪念日 · 我们仨',
      short_name: '纪念日',
      description: '一个装满旅行、照片和故事的家庭记忆簿。',
      theme_color: '#173b33',
      background_color: '#f7f2e8',
      display: 'standalone',
      lang: 'zh-CN',
      start_url: '/',
      icons: [
        {
          src: '/icons/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icons/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/icons/maskable-icon-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{css,html,png,jpg,jpeg,svg,webp,woff2}'],
      globIgnores: ['images/anniversaries/**'],
      runtimeCaching: [
        {
          urlPattern: /\/images\/anniversaries\/.*\.webp$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'anniversary-photos',
            expiration: {
              maxEntries: 8,
              maxAgeSeconds: 60 * 60 * 24 * 365,
            },
          },
        },
        {
          urlPattern: /\/_nuxt\/.*\.js$/,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'nuxt-scripts',
            expiration: {
              maxEntries: 80,
              maxAgeSeconds: 60 * 60 * 24 * 30,
            },
          },
        },
      ],
    },
    devOptions: {
      enabled: false,
    },
  },
})
