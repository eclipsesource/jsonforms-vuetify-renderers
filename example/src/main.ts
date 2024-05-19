import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './stores';
import initializeVuetify from './plugins/vuetify';

const app = createApp(App).use(store).use(router);
app.use(initializeVuetify(app));
app.mount('#app');
