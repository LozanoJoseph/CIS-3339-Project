import { createApp, markRaw } from 'vue'
import router from './router'
import App from './App.vue'
import './index.css'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import { createPinia } from 'pinia'
import { useLoggedInUserStore } from './store/loggedInUser'
import { setUnauthorizedHandler } from './api/api'

const app = createApp(App)
const pinia = createPinia()

// Make Vue Router available to Pinia actions.
pinia.use(({ store }) => {
  store.$router = markRaw(router)
})

app.use(pinia)

const user = useLoggedInUserStore(pinia)

// The Axios interceptor owns 401 handling. This callback lets it clear the
// Pinia session and navigate without api.js importing the store/router directly.
setUnauthorizedHandler(() => {
  const redirect = router.currentRoute.value.fullPath
  user.clearSession()

  if (router.currentRoute.value.path !== '/login') {
    router.push({
      path: '/login',
      query: redirect && redirect !== '/login' ? { redirect } : undefined
    })
  }
})

user.restoreSession()

app.use(router)

const options = {
  position: 'bottom-right'
}
app.use(Toast, options)
app.mount('#app')
