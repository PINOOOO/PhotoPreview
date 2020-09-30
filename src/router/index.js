import VueRouter from 'vue-router'

const routes = [
  {
    path: '/',
    redirect:'/single',
  },
  {
    path:"/single",
    component: () => import(/* webpackChunkName: "single" */ '@/page/single')
  },
  {
    path:"/multitude",
    component: () => import(/* webpackChunkName: "multitude" */ '@/page/multitude')
  }
]

export default new VueRouter({
  routes
})
