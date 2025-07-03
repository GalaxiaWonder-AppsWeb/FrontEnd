import App from './App.vue'
import PrimeVue from 'primevue/config';
import 'primeicons/primeicons.css'
import Aura from '@primevue/themes/aura';
import { createApp } from 'vue'
import Toast from 'primevue/toast';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import ConfirmDialog from 'primevue/confirmdialog';
import Tooltip from 'primevue/tooltip'; // Import the Tooltip directive


import {
    SelectButton,
    Textarea,
    InputText,
    Password,
    Button,
    Message,
    Select,
    Toolbar,
    Card,
    Dialog,
    ProgressSpinner,
    Tag,
    Calendar,
    InputNumber,
    DatePicker,
    ProgressBar,
    RadioButton,
    DataTable,
    Dropdown,
    MultiSelect,
    Column,
    Checkbox
} from "primevue";
import DataView from 'primevue/dataview';

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

// Register directives
app.directive('tooltip', Tooltip); // Register the Tooltip directive

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
   .component('pv-toast', Toast)   .component('pv-progress-spinner', ProgressSpinner)
   .component('pv-confirm-dialog', ConfirmDialog)
   .component('pv-tag', Tag)
   .component('pv-calendar', Calendar)
   .component('pv-date-picker', DatePicker)
   .component('pv-progress-bar', ProgressBar)
   .component('pv-radio-button', RadioButton)
   .component('pv-data-view', DataView)
   .component('pv-data-table', DataTable)
   .component('pv-dropdown', Dropdown)
   .component('pv-multi-select', MultiSelect)
   .component('pv-column', Column)
   .component('pv-input-number', InputNumber)
    .component('pv-checkbox', Checkbox)
    .component('pv-input-textarea', Textarea);

// Exponer el servicio de toast globalmente para el guardia de navegación
const toastService = app.config.globalProperties.$toast;
window.$toast = toastService;

app.mount('#app');
