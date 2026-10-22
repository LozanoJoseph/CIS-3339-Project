import { defineStore } from 'pinia'
import { useToast } from 'vue-toastification'
import { loginUser, logoutUser, setAuthHeader } from '../api/api'
import jwt_decode from 'jwt-decode'

const toast = useToast()

export const useLoggedInUserStore = defineStore({
  id: 'loggedInUser',

  state: () => ({
    name: '',
    role: '',
    isLoggedIn: false
  }),

  actions: {
    clearSession() {
      logoutUser()
      this.$reset()
    },

    applyToken(token) {
      const decodedToken = jwt_decode(token)

      if (
        !Number.isFinite(decodedToken.exp) ||
        decodedToken.exp <= Date.now() / 1000 ||
        typeof decodedToken.name !== 'string' ||
        typeof decodedToken.role !== 'string'
      ) {
        throw new Error('Invalid or expired session. Please log in again.')
      }

      setAuthHeader(token)

      this.$patch({
        name: decodedToken.name,
        role: decodedToken.role,
        isLoggedIn: true
      })
    },

    restoreSession() {
      try {
        const token = localStorage.getItem('authToken')

        if (!token) {
          this.clearSession()
          return
        }

        this.applyToken(token)
      } catch {
        this.clearSession()
      }
    },

    async login(username, password) {
      try {
        const token = await loginUser(username, password)
        this.applyToken(token)
        this.$router.push('/')
        toast.success('Login successful!')
      } catch (error) {
        this.clearSession()
        toast.error(error.message || 'Unable to log in.')
      }
    },

    logout() {
      this.clearSession()
      this.$router.push('/')
      toast.info('You have been logged out!')
    }
  }
})