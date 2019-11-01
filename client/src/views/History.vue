<template>
    <div class="notif">
        <h1 class="subheading mt-2 ml-4">
            <span class="grey--text">VISIT</span>
            <span>HISTORY</span>
        </h1>
        <v-container class="my-5">
            
            <v-card flat class="px-3 ma-auto" v-for="notif in history" :key="notif.time" max-width="1000px">
                <v-layout row wrap justify-space-around=""  class="pa-3 jnab" >
                     <v-flex xs4 sm2 md1>
                         <span class="caption grey--text">User Avatar</span><br>
                         <v-avatar size="36px">
                            <img :src="notif.profile_img" alt="">
                        </v-avatar>
                     </v-flex>
                     <v-flex sm5 md3 hidden-xs-only>
                         <span class="caption grey--text">Username</span><br>
                         <strong>{{notif.username}}</strong>
                     </v-flex>
                     <v-flex xs5 sm3>
                         <span class="caption grey--text ml-2">Date</span><br>
                         <v-chip :color="generator" class="white--text">{{ TIME(notif.time) }}</v-chip>
                     </v-flex>
                </v-layout>
                 <v-divider class="ma-0"></v-divider>
            </v-card>
        </v-container>
    </div>
</template>

<script>
import Axios from 'axios'
import Moment from 'moment'

export default {
    mounted() {
        this.loadHistory()
    },
    data() {
        return {
            history: [],
        }
    },
    methods: {
        loadHistory() {
            const token = window.localStorage.getItem('token')
            if (token) Axios.defaults.headers.common['x-auth-token'] = token
            else delete Axios.defaults.headers.common['x-auth-token']
            Axios.get("http://localhost:3001/notif/loadHistory")
            .then (Response => {
                if (Response.data == "Invalid token." || Response.data == "No token provided")
                    this.$router.push({name: 'login'})
                else if (Response.data != "Empty")
                    this.history = Response.data
            })
            .catch(error => {
                this.$router.push({name: 'login'})
            })
        },
        TIME(time)
        {
            if (time)
                return Moment(time).format("YYYY-MM-DD HH:mm:ss");
        },
    },
    computed: {
        generator() {
                return ('#'+(Math.random()*0xFFFFFF<<0).toString(16))
            }
    }
}
</script>

<style>

.jnab {
    border-left: 4px solid #3cd1c2;
}

</style>