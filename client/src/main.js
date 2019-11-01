import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'
import SettingsComponent from '@/views/Settings'
import store from './store'
import axios from 'axios'
import Vuetify from "vuetify"
import io from 'socket.io-client'
import VueSocketIO from 'vue-socket.io'

Vue.use(new VueSocketIO({ 
  connection: io('http://localhost:3001') 
}))

Vue.config.productionTip = false
Vue.use(Vuetify);

const token = window.localStorage.getItem('token')
if (token) axios.defaults.headers.common['x-auth-token'] = token
else delete axios.defaults.headers.common['x-auth-token']

new Vue({
  name: "ParentComponent",
  router,
  store,
  data: {

    userAuth: token ? token : false,
    userData: {},
    
  },
  components: {
    SettingsComponent,
  },
  
  render: h => h(App),
}).$mount('#app')
