<template>
<v-container fill-height fluid grid-list-xl>
            <v-layout justify-space-around wrap>
            <v-flex xs12 md7>
                <v-card max-width="600">
                    <v-toolbar height="60px"  dark>
                    <v-icon color="blue lighten-2">lock_open</v-icon>
                    <v-toolbar-title>Login</v-toolbar-title>
                    </v-toolbar>
                    <v-form v-model="valid" ref="form" lazy-validation class="mx-3 mt-3">
                        <v-text-field  class="purple-input" v-model="username" :counter="20" :rules="nameRules" label="Username" required />
                        <v-text-field  v-model="password" :rules="passwordRules" label="Password" :type="show1 ? 'text' : 'password'"
                         @click:append="show1 = !show1" :append-icon="show1 ? 'visibility' : 'visibility_off'" :counter="20" required/>
                        <v-btn :disabled="!valid || !isEmpty" @click="registerUser" class="mx-0 font-weight-light"  color="success">
                            <span> Login </span>
                        </v-btn>
                        <v-btn class="mt-1 white--text font-weight-light" to="forgot" color="blue lighten-2" absolute right>
                            <span>FORGOT PASSWORD</span>
                        </v-btn>
                </v-form>
                <v-snackbar v-model="snackbar" :timeout="timeout" color="error" top class="mt-4">
                {{ text }}
                <v-btn color="white"  flat  @click="snackbar = false">
                    Close
                </v-btn>
                </v-snackbar>
        </v-card>
            </v-flex>
    </v-layout>
</v-container>
</template>

<script>
import Axios from 'axios'

export default {
    data() {
        return {
            valid: true,
            show1: false,
            snackbar: false,
            timeout: 5000,
            text: '',  
            username: '',
            nameRules: [
                v => !!v || 'Username is required',
                v => (v && v.length <= 20) || 'Userame must be less than 20 characters'
            ],
            password: '',
            passwordRules: [
                v => !!v || 'Password is required',
                v => (v && v.length <= 20) || 'Name must be less than 20 characters'
            ],
        }
    },
    
    methods: {
        registerUser() {
            Axios.post("http://localhost:3001/login", {
                username: this.username,
                password: this.password
            })
            .then(response => {
                if (response.data == "Invalid token." || response.data == "No token provided")
                    this.$router.push({name: 'login'})
                else if (response.data.status == "failure"){
                    this.text = response.data.msg
                    this.snackbar = true
                } else {
                    window.localStorage.setItem('token', response.data.authToken);
                    this.$router.push({name: 'Settings'})
                }
            })
            .catch(error => {
                this.$router.push({name: 'login'})
            })
        },
        removeDiv() {
            this.status = 0
        }
    },
    computed: {
        isEmpty() {
            return  this.username && this.password
        },
        title() {
            return this.$store.state.title
        }
    }
}
</script>