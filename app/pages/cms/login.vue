<script setup lang="ts">
import { LockOutlined, UserOutlined } from '@ant-design/icons-vue'

definePageMeta({
  layout: 'cms-auth',
})

useHead({ title: '登录' })

const route = useRoute()
const router = useRouter()
const { request, errorMessage } = useCmsApi()
const form = reactive({
  username: 'admin',
  password: '',
  remember: true,
})
const loading = ref(false)
const error = ref('')
const configurationError = ref(false)

onMounted(async () => {
  const remembered = localStorage.getItem('keepsake-cms-user')
  if (remembered) {
    form.username = remembered
  }

  try {
    const session = await request<{ authenticated: boolean }>('/api/cms/auth/session')
    if (session.authenticated) {
      await router.replace('/cms')
    }
  }
  catch {
    // Stay on the login page when the session endpoint is unavailable.
  }
})

async function submit() {
  if (!form.username || !form.password) {
    error.value = '请输入账号和密码。'
    return
  }

  loading.value = true
  error.value = ''
  configurationError.value = false
  try {
    await request('/api/cms/auth/login', {
      method: 'POST',
      body: {
        username: form.username,
        password: form.password,
      },
    })
    if (form.remember) {
      localStorage.setItem('keepsake-cms-user', form.username)
    }
    else {
      localStorage.removeItem('keepsake-cms-user')
    }
    const target = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
      ? route.query.redirect
      : '/cms'
    await router.replace(target)
  }
  catch (cause) {
    configurationError.value = causeMessage(cause).includes('配置')
    error.value = causeMessage(cause)
  }
  finally {
    loading.value = false
  }
}

function causeMessage(cause: unknown) {
  return errorMessage(cause)
}
</script>

<template>
  <div class="login-page">
    <div class="login-page__shape login-page__shape--one" />
    <div class="login-page__shape login-page__shape--two" />
    <div class="login-page__grain" />

    <section class="login-story">
      <CmsBrandMark light />
      <div class="login-story__content">
        <p class="login-story__eyebrow">
          FAMILY ARCHIVE · PRIVATE SPACE
        </p>
        <h1>
          把每一次远行，<br>
          轻轻放在这里。
        </h1>
        <p>
          管理相册、旅行影像与文字记录。所有内容继续保存在 uniCloud，
          Keepsake CMS 只负责让日常维护变得简单。
        </p>
      </div>
      <p class="login-story__footnote">
        A quiet place for the three of us.
      </p>
    </section>

    <section class="login-panel">
      <div class="login-card">
        <div class="login-card__heading">
          <span class="login-card__monogram">K</span>
          <div>
            <p>欢迎回来</p>
            <h2>登录管理后台</h2>
          </div>
        </div>

        <a-alert
          v-if="configurationError"
          class="login-card__alert"
          type="warning"
          show-icon
          message="后台认证尚未配置"
          description="请在后台项目的 .env 中设置管理员密码和会话密钥。"
        />
        <a-alert
          v-else-if="error"
          class="login-card__alert"
          type="error"
          show-icon
          :message="error"
        />

        <form
          class="login-form"
          @submit.prevent="submit"
        >
          <label>
            <span>管理员账号</span>
            <a-input
              v-model:value="form.username"
              size="large"
              autocomplete="username"
              placeholder="请输入账号"
            >
              <template #prefix>
                <UserOutlined />
              </template>
            </a-input>
          </label>

          <label>
            <span>密码</span>
            <a-input-password
              v-model:value="form.password"
              size="large"
              autocomplete="current-password"
              placeholder="请输入密码"
            >
              <template #prefix>
                <LockOutlined />
              </template>
            </a-input-password>
          </label>

          <div class="login-form__meta">
            <a-checkbox v-model:checked="form.remember">
              记住账号
            </a-checkbox>
            <span>内容仅限管理员访问</span>
          </div>

          <a-button
            type="primary"
            html-type="submit"
            size="large"
            block
            :loading="loading"
          >
            进入 Keepsake
          </a-button>
        </form>

        <div class="login-card__hint">
          <span />
          uniCloud 数据由服务端安全代理
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.login-page {
  position: relative;
  display: grid;
  min-height: 100vh;
  grid-template-columns: minmax(0, 1.05fr) minmax(28rem, 0.95fr);
  overflow: hidden;
  background: #f6f1e7;
}

.login-page__shape {
  position: absolute;
  border-radius: 48% 52% 57% 43% / 43% 42% 58% 57%;
  pointer-events: none;
}

.login-page__shape--one {
  z-index: 0;
  top: -13rem;
  right: -10rem;
  width: 39rem;
  height: 32rem;
  background: rgba(232, 182, 91, 0.16);
  transform: rotate(-16deg);
}

.login-page__shape--two {
  z-index: 0;
  bottom: -18rem;
  left: 28%;
  width: 44rem;
  height: 32rem;
  background: rgba(231, 125, 95, 0.08);
  transform: rotate(17deg);
}

.login-page__grain {
  position: absolute;
  z-index: 1;
  inset: 0;
  opacity: 0.1;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.1'/%3E%3C/svg%3E");
  pointer-events: none;
}

.login-story {
  position: relative;
  z-index: 2;
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  padding: clamp(2rem, 5vw, 4rem);
  color: #fffaf0;
  background:
    radial-gradient(circle at 72% 18%, rgba(232, 182, 91, 0.25), transparent 16rem),
    radial-gradient(circle at 22% 92%, rgba(231, 125, 95, 0.2), transparent 22rem),
    #143c32;
}

.login-story::after {
  position: absolute;
  right: -8rem;
  bottom: -7rem;
  width: 29rem;
  height: 23rem;
  border: 1px solid rgba(232, 182, 91, 0.19);
  border-radius: 49% 51% 38% 62% / 44% 43% 57% 56%;
  content: "";
  transform: rotate(20deg);
}

.login-story__content {
  max-width: 39rem;
  margin-block: auto;
  padding-block: 5rem;
}

.login-story__eyebrow {
  margin: 0 0 1.35rem;
  color: #e9b75b;
  font-size: 0.64rem;
  font-weight: 750;
  letter-spacing: 0.18em;
}

.login-story h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(2.8rem, 5vw, 5.25rem);
  font-weight: 500;
  letter-spacing: -0.055em;
  line-height: 1.08;
}

.login-story__content > p:last-child {
  max-width: 31rem;
  margin: 1.75rem 0 0;
  color: rgba(255, 250, 240, 0.6);
  font-size: 0.9rem;
  line-height: 1.9;
}

.login-story__footnote {
  margin: 0;
  color: rgba(255, 250, 240, 0.36);
  font-family: var(--font-display);
  font-size: 0.82rem;
  font-style: italic;
}

.login-panel {
  position: relative;
  z-index: 2;
  display: grid;
  place-items: center;
  padding: 2rem;
}

.login-card {
  width: min(100%, 27rem);
  border: 1px solid rgba(29, 47, 41, 0.08);
  border-radius: 1.6rem;
  padding: clamp(1.5rem, 3vw, 2.35rem);
  background: rgba(255, 253, 248, 0.94);
  box-shadow: 0 30px 90px rgba(29, 47, 41, 0.11);
  backdrop-filter: blur(18px);
}

.login-card__heading {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  margin-bottom: 2rem;
}

.login-card__monogram {
  display: grid;
  width: 3rem;
  height: 3rem;
  place-items: center;
  border-radius: 1rem;
  color: #fffaf0;
  background: #17644f;
  font-family: var(--font-display);
  font-size: 1.45rem;
}

.login-card__heading p {
  margin: 0 0 0.2rem;
  color: var(--cms-muted);
  font-size: 0.68rem;
}

.login-card__heading h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.72rem;
  font-weight: 500;
  letter-spacing: -0.035em;
}

.login-card__alert {
  margin-bottom: 1.1rem;
}

.login-form {
  display: grid;
  gap: 1.1rem;
}

.login-form label {
  display: grid;
  gap: 0.48rem;
}

.login-form label > span {
  color: var(--cms-ink);
  font-size: 0.73rem;
  font-weight: 650;
}

.login-form :deep(.ant-input-affix-wrapper) {
  border-radius: 0.8rem;
}

.login-form__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  color: var(--cms-muted);
  font-size: 0.68rem;
}

.login-form :deep(.ant-btn) {
  height: 3rem;
  margin-top: 0.25rem;
  border-radius: 0.8rem;
}

.login-card__hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  margin-top: 1.6rem;
  color: var(--cms-muted);
  font-size: 0.63rem;
}

.login-card__hint span {
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 50%;
  background: #70ae89;
}

@media (max-width: 900px) {
  .login-page {
    grid-template-columns: 1fr;
  }

  .login-story {
    min-height: 18rem;
    padding: 1.4rem 1.25rem 2rem;
  }

  .login-story__content {
    padding-block: 2.5rem 1rem;
  }

  .login-story h1 {
    font-size: clamp(2.3rem, 9vw, 3.6rem);
  }

  .login-story__content > p:last-child,
  .login-story__footnote {
    display: none;
  }

  .login-panel {
    align-items: start;
    padding: 1rem 0.75rem 2rem;
  }

  .login-card {
    margin-top: -1.4rem;
  }
}
</style>
