import App from './App.vue'
import PrimeVue from 'primevue/config';
import 'primeicons/primeicons.css'
import Aura from '@primevue/themes/aura';
import { createApp } from 'vue'
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import ConfirmDialog from 'primevue/confirmdialog';


import {SelectButton, InputText, Password, Button, Message, Select, Toolbar, Card, Dialog, ProgressSpinner, Tag} from "primevue";


import i18n from "./i18n.js";
import router from "./router/index.js";
import './style.css'

const app = createApp(App);

// Configurar PrimeVue
app.use(PrimeVue, { ripple: true, theme: {preset: Aura}})
   .use(ToastService)
   .use(ConfirmationService)
   .use(i18n)
   .use(router);

// Componentes PrimeVue
app.component('pv-select-button', SelectButton)
   .component('pv-input-text', InputText)
   .component('pv-password', Password)
   .component('pv-button', Button)
   .component('pv-message', Message)
   .component('pv-select', Select)
   .component('pv-toolbar', Toolbar)
   .component('pv-card', Card)
   .component('pv-dialog', Dialog)
   .component('pv-toast', Toast)
   .component('pv-progress-spinner', ProgressSpinner)
   .component('pv-confirm-dialog', ConfirmDialog)
   .component('pv-tag', Tag);

// Exponer el servicio de toast globalmente para el guardia de navegación
const toastService = app.config.globalProperties.$toast;
window.$toast = toastService;

app.mount('#app');
