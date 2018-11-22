import Vue from 'vue'
import iView from 'iview'
import App from './App'
// import './my-theme/dist/iview.css'
import 'iview/dist/styles/iview.css'
import db from './db/db'

Vue.config.productionTip = false;
Vue.use(iView);
Vue.prototype.$db = db;

/* eslint-disable no-new */
new Vue({
  components: { App },
  template: '<App/>'
}).$mount('#app')
