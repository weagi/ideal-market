import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'dayjs/locale/zh-cn'

const app = createApp(App)
app.use(ElementPlus, { locale: 'zh-cn' })
app.use(router)
app.mount('#app')