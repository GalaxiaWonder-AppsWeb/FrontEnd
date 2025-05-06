import App from './App.vue'
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import { createApp } from 'vue'
import {SelectButton} from "primevue";

import i18n from "./i18n.js";
import router from "./router/index.js";
import './style.css'

createApp(App).use(i18n)
    .use(PrimeVue, { ripple: true, theme: {preset: Aura}})
    .use(router)
    .component('pv-select-button', SelectButton)
    .mount('#app')
