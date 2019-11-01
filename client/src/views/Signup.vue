<template>
<v-container fill-height fluid grid-list-xl>
            <v-layout justify-space-around wrap>
            <v-flex xs12 md7>
                <v-card max-width="800">
                    <v-toolbar  dark>
                    <v-icon color="blue lighten-2">how_to_reg</v-icon>
                    <v-toolbar-title>Sign up</v-toolbar-title>
                    </v-toolbar>
                    <v-form v-model="valid" ref="form" lazy-validation class="mx-3 mt-3">
                        <v-text-field  v-model="credentials.first_name" :counter="20" :rules="firstNameRules" label="First name" required class="purple-input"/>
                        <v-text-field  v-model="credentials.last_name" :counter="20" :rules="lastNameRules" label="Last name" required class="purple-input"/>
                        <v-text-field  class="purple-input" v-model="credentials.username" :counter="20" :rules="nameRules" label="Username" required />
                        <v-text-field  v-model="credentials.email" :rules="emailRules" label="Email Address" required/>
                        <v-text-field  v-model="credentials.password" :rules="passwordRules" label="Password" :type="show1 ? 'text' : 'password'"
                         @click:append="show1 = !show1" :append-icon="show1 ? 'visibility' : 'visibility_off'" :counter="20" required/>
                        <v-btn :disabled="!valid || !isEmpty" @click="registerUser" class="mx-0 font-weight-light"  color="success">
                        Sign up
                        </v-btn>
                </v-form>
                <v-snackbar v-model="snackbar" :color="snackColor" :timeout="5000" top class="mt-4">
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
            show1: false,
            snackbar: false,
            text: '',
            credentials: {
                first_name: '',
                last_name: '',
                username: '',
                email: '',
                password: '',
            },
            firstNameRules: [
                v => !!v || 'First name is required',
                v => (v && v.length <= 20) || 'First name must be less than 20 characters'
            ],
            
            lastNameRules: [
                v => !!v || 'Last Name is required',
                v => (v && v.length <= 20) || 'Last name must be less than 20 characters'
            ],
            
            nameRules: [
                v => !!v || 'Username is required',
                v => (v && v.length <= 20) || 'Userame must be less than 20 characters'
            ],
            
            passwordRules: [
                v => !!v || 'Password is required',
                v => /^[a-zA-Z0-9]{3,20}$/.test(v) || 'password only alphanum and must be between 3 and 20 characters'
            ],
            
            emailRules: [
                v => !!v || 'E-mail is required',
                v => /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v) || 'E-mail must be valid'
            ],
            status: 0,
        }
    },
    
    methods: {
        registerUser() {
            Axios.post("http://localhost:3001/signup", this.credentials)
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
                this.text = response.data.msg
                this.snackbar = true
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
            return this.credentials.first_name && this.credentials.last_name && this.credentials.username 
            && this.credentials.email && this.credentials.password
        }
    }
}
</script>

