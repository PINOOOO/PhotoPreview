import '@/style/main'
import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import router from '@/router'

!window.Promise && (window.Promise = Promise)

Vue.use(VueRouter)
Vue.use(Vuex)

/* eslint-disable no-new */
new Vue({
  el: 'app',
  router,
  render (h) {
    return (<router-view/>)
  }
})
