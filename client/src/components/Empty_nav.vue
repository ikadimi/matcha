<template>
<nav>
  <v-toolbar dark color="darken-4 dark" app height="60">
      <v-toolbar-title class="white--text">Matcha</v-toolbar-title>
    <v-spacer></v-spacer>


    <v-toolbar-items>
     
      <v-btn v-if="this.$route.name === 'signup' || this.$route.name === 'forgot'" to="/login" flat>Login</v-btn>
      <v-btn v-if="this.$route.name === 'login'" to="/signup" flat>Signup</v-btn>

    </v-toolbar-items>
  </v-toolbar>


  </nav>
</template>