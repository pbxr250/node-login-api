import Vue from 'vue';
import VeeValidate from 'vee-validate';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';

import { store } from './_store';
import { router } from './_helpers';
import App from './app/App';

Vue.use(VeeValidate, {
    inject: true,
    fieldsBagName: 'veeFields'
  });
Vue.use(BootstrapVue);

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import './main.css';

// setup fake backend
//import { configureFakeBackend } from './_helpers';
//configureFakeBackend();

import * as webgl from './webgl.js';

new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
});