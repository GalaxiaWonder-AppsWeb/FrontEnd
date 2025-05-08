import App from './App.vue'
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import { createApp } from 'vue'

import {SelectButton, InputText, Password, Button, Message, Select} from "primevue";


import i18n from "./i18n.js";
import router from "./router/index.js";
import './style.css'

createApp(App).use(i18n)
    .use(PrimeVue, { ripple: true, theme: {preset: Aura}})
    .use(router)
    .component('pv-select-button', SelectButton)
    .component('pv-input-text', InputText)
    .component('pv-password', Password)
    .component('pv-button', Button)
    .component('pv-message', Message)
    .component('pv-select', Select)
    .mount('#app')
