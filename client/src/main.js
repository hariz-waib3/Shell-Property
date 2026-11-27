import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initDb } from './stores/db'
import './assets/main.css'

// Load the saved demo data first, so every page starts with it.
initDb().then(() => {
  createApp(App).use(router).mount('#app')
})
