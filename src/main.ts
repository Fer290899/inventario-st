import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@fontsource-variable/ibm-plex-sans'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import '@fontsource/ibm-plex-mono/600.css'
import './css/main.css'

import App from './App.vue'
import router from './router'

// Los datos de ejemplo se siembran al cargar cada módulo y se modifican entre sí (una devolución cambia
// el estatus de un bien). Se cargan en orden fijo antes de montar para que el dashboard y las listas
// vean siempre el mismo estado, sin depender de qué página se abra primero.
import './composables/useAuditoria'
import './composables/useBienesData'
import './composables/useMovimientosData'
import './composables/useMantenimientosData'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
