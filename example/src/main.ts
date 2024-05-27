import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './stores';
import createVuetify from './plugins/vuetify';

createApp(App).use(store).use(router).use(createVuetify()).mount('#app');
