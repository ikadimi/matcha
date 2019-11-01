<template>
    <div class="block">
        <h1 class="subheading mt-2 ml-4">
            <span class="grey--text">MATCHA</span>
            <span>JAIL</span>
        </h1>
        <v-container class="my-4">
            
            <v-card flat class="px-3 ma-auto" v-for="block in blocked" :key="block.id" max-width="1000px">
                <v-layout row wrap justify-space-around=""  class="pa-3 side" >
                     <v-flex xs3 >
                         <span class="caption grey--text">User Avatar</span><br>
                         <v-avatar size="36px" class="ml-2">
                            <img :src="block.profile_img" alt="">
                        </v-avatar>
                     </v-flex>
                     <v-flex xs3>
                        <span class="caption grey--text">Username</span><br>
                        <strong>{{block.username}}</strong>

                     </v-flex>
                     <v-flex xs3 hidden-xs-only>
                        <span class="caption grey--text">Full Name</span><br>
                        <span class="pr-1">{{block.first_name}}</span>
                        <span>{{block.last_name}}</span> 

                     </v-flex>
                     <v-flex xs3 >
                         <span class="caption grey--text">Unblock</span><br>
                         <v-btn @click="removeBlock(block.id)" color="white" fab small>
                             <v-icon color="error">fa-hand-peace</v-icon>
                         </v-btn>
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
        this.loadBlocked()
    },
    data() {
        return {
            blocked: [],
        }
    },
    methods: {
        removeBlock(blockedId)
        {
            Axios.post("http://localhost:3001/inbox/removeBlock", {blocked: blockedId})
            .then (Response => {
                if (Response.data == "Invalid token." || Response.data == "No token provided")
                    this.$router.push({name: 'login'})
                else if (Response.data === "done")
                    this.blocked = this.blocked.filter(choice => choice.id != blockedId)
            })
            .catch(error => {
                this.$router.push({name: 'login'})
            })
        },
        loadBlocked() {
            Axios.get("http://localhost:3001/inbox/blockedList")
            .then (Response => {
                if (Response.data == "Invalid token." || Response.data == "No token provided")
                    this.$router.push({name: 'login'})
                else if (Response.data != "Empty")
                    this.blocked = Response.data
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

.side {
    border-left: 4px solid #212121;
}

</style>
