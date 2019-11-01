import Vue from 'vue'
import Router from 'vue-router'
import Login from './views/Login.vue'
import Signup from './views/Signup.vue'
import Profile from './views/Profile.vue'
import Matches from './views/Matches.vue'
import Blocked from './views/Blocked.vue'
import Notif from './views/Notif.vue'
import Settings from './views/Settings.vue'
import Historyy from './views/History'
import Forgot from './views/Forgot'
import store from './store'

Vue.use(Router)

const router = new Router({
    routes: [
        {
            path: '/',
            name: 'home',
            component: Login,
        },
        {
            path: '/login',
            name: 'login',
            component: Login,
        },
        {
            path: '/forgot',
            name: 'forgot',
            component: Forgot,
        },
        {
            path: '/signup',
            name: 'signup',
            component: Signup,
        },
        {
            path: '/profile',
            name: 'profile',
            component: Profile,
        },
        {
            path: '/matches',
            name: 'matches',
            component: Matches,
        },
        {
            path: '/blocked',
            name: 'blocked',
            component: Blocked,
        },
        {
            path: '/notif',
            name: 'notif',
            component: Notif,
        },
        {
            path: '/settings',
            name: 'Settings',
            component: Settings,
        },
        {
            path: '/history',
            name: 'History',
            component: Historyy,
        },
        ]
})

const   openRoutes = ['login', 'signup', 'forgot']

router.beforeEach((to, from, next) => {
    if (openRoutes.includes(to.name))
        next()
    else if (from.name === 'Settings' && store.state.updated === 0)
        next('/settings')
    else if (window.localStorage.token)
        next()
    else
        next('/login')
  })

export default router;