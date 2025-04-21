import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    id: null as number | null,
    username: null as string | null,
    role: null as string | null,
    token: null as string | null,
    isLoggedIn: false
  }),
  
  actions: {
    setUser(userData: { id: number, username: string, role: string, token: string }) {
      console.log('Setting user data:', userData)
      this.id = userData.id
      this.username = userData.username
      this.role = userData.role
      this.token = userData.token
      this.isLoggedIn = true
      
      // 存储到本地存储以便页面刷新后恢复
      localStorage.setItem('token', userData.token)
      localStorage.setItem('userId', userData.id.toString())
      localStorage.setItem('username', userData.username)
      localStorage.setItem('userRole', userData.role)
    },
    
    logout() {
      console.log('Logging out user')
      this.id = null
      this.username = null
      this.role = null
      this.token = null
      this.isLoggedIn = false
      
      // 清除本地存储
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      localStorage.removeItem('username')
      localStorage.removeItem('userRole')
    },
    
    restoreFromStorage() {
      console.log('Restoring user from storage')
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')
      const username = localStorage.getItem('username')
      const userRole = localStorage.getItem('userRole')
      
      console.log('Storage data:', { token, userId, username, userRole })
      
      if (token && userId && username && userRole) {
        this.id = parseInt(userId)
        this.username = username
        this.role = userRole
        this.token = token
        this.isLoggedIn = true
        console.log('User restored successfully')
      } else {
        console.log('No user data in storage')
      }
    }
  },
  
  getters: {
    isAdmin: (state) => state.role === 'admin',
    getToken: (state) => state.token
  }
})
