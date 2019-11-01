<template>
  <v-footer height="auto"  color="grey darken-3">
    <v-layout justify-center  row wrap>
        <v-flex class="text-md-center" v-if="this.$route.name !== 'login' && this.$route.name !== 'signup' && this.$route.name !== 'forgot'">
            <v-btn  v-for="link in links" :key="link.route" color="white" flat round :to="link.route" >
                {{ link.text }}
            </v-btn>
        </v-flex>
      <v-flex grey darken-4 dark  py-3 text-xs-center white--text xs12>
        &copy;2019 — <strong>Matcha</strong>
      </v-flex>
    </v-layout>
  </v-footer>
</template>

<script>
export default {
    data() {
        return {
            links: [
                { icon: 'person', text: 'Profile', route: '/profile' },
                { icon: 'favorite', text: 'Matches', route: '/matches' },
                { icon: 'fa-book-dead', text: 'Blocked', route: '/blocked' },
                { icon: 'notifications', text: 'Notifications', route: '/notif' },
                { icon: 'settings', text: 'Settings', route: '/settings' },
                { icon: 'history', text: 'History', route: '/history' }
            ]
        }
    }
}
</script>
