<template>
  <v-app>
    <Navbar v-if="this.$route.name !== 'login' && this.$route.name !== 'signup' && this.$route.name !== 'forgot'" />
    <EmptyNav v-else></EmptyNav>
    <v-content class="mx-4 mb-4">
      
      <router-view @inputData="updateData"></router-view>

    </v-content>
    <Footer />
  </v-app>
</template>

<script>
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import EmptyNav from '@/components/Empty_nav'

export default {
  name: 'App',
  components: {
    Navbar,
    Footer,
    EmptyNav
  },
  data () {
    return {
      userData: {}
    }
  },
  methods: {
    updateData(data) {
      console.log("data");
      this.userData = data;
    }
  }
}
</script>
