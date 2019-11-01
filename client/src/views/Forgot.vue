<template>
<v-container fill-height fluid grid-list-xl>
            <v-layout justify-space-around wrap>
            <v-flex xs12 md7>
                <v-card max-width="600">
                    <v-toolbar height="60px"  dark>
                    <v-icon color="blue lighten-2">autorenew</v-icon>
                    <v-toolbar-title>Resset password</v-toolbar-title>
                    </v-toolbar>
                    <v-form v-model="valid" ref="form" lazy-validation class="mx-3 mt-3">
                        <v-text-field  class="purple-input" v-model="email" :rules="emailRules" label="Email" required />
                    
                        <v-btn :disabled="!valid || !isEmpty" @click="registerUser" class="mx-0 font-weight-light"  color="success">
                            <span> SUBMIT </span>
                        </v-btn>
                </v-form>
                <v-snackbar v-model="snackbar" :timeout="timeout" :color="snackColor" top class="mt-4">
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
            snackColor: '',
            valid: true,
            snackbar: false,
            timeout: 5000,
            text: '',  
            email: '',
            emailRules: [
                v => !!v || 'E-mail is required',
                v => /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v) || 'E-mail must be valid'
            ],
        }
    },
    
    methods: {
        registerUser() {
            Axios.post("http://localhost:3001/login/forgot_ps", {email: this.email})
            .then(response => {
                if (response.data.status == "failure"){
                    this.text = response.data.msg
                    this.snackColor = 'error'
                    this.snackbar = true
                } else {
                    this.text = response.data.msg
                    this.snackColor = 'success'
                    this.snackbar = true
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
            return  this.email
        },
    }
}
</script>