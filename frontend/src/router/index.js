import { createRouter, createWebHistory } from 'vue-router'
import MarketView from '../views/MarketView.vue'

const routes = [
  {
    path: '/',
    name: 'market',
    component: MarketView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router