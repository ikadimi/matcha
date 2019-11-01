<template>
    <div class="notif">

        <v-container class="my-5">
            <v-card v-if="notifs === 'no messages'" max-width="1000px">
                <v-card-text class="font-weight-medium font-italic">You have no notifications yet</v-card-text>
            </v-card>
            <v-card v-else flat class="px-3 ma-auto" v-for="notif in notifs" :key="notif.time" max-width="1000px">
                <v-layout row wrap justify-space-around=""  :class="`pa-2 notif ${notif.action}`" style="cursor: pointer" @click="goToProfile(notif.id)">
                     <v-flex xs2 >
                         <span class="caption grey--text">User Avatar</span><br>
                         <v-avatar size="36px" >
                            <img :src="notif.profile_img" alt="">
                        </v-avatar>
                     </v-flex>
                     <v-flex sm2 hidden-xs-only>
                         <span class="caption grey--text">Username</span><br>
                         <strong>{{notif.username}}</strong>
                     </v-flex>
                     <v-flex sm2 hidden-xs-only>
                         <span class="caption grey--text">Action</span><br>
                         <strong>{{notif.action}}</strong>
                     </v-flex>
                     <v-flex xs4 >
                         <span class="caption grey--text ml-2">Date</span><br>
                         <v-chip :class="`${notif.action} white--text my-2`">{{ TIME(notif.time) }}</v-chip>
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
        this.loadNotifs()
    },
    data() {
        return {
            notifs: null
        }
    },
    methods: {
        goToProfile(userid)
        {
            this.$router.push({name: 'profile', params: {id : userid}})
        },
        TIME(time)
        {
            if (time)
                return Moment(time).format("YYYY-MM-DD HH:mm:ss");
        },
        loadNotifs() {
            Axios.post("http://localhost:3001/inbox/loadNotification", {msg: "full"})
            .then(Response => {
                if (Response.data == "Invalid token." || Response.data == "No token provided")
                    this.$router.push({name: 'login'})
                else if (Response.data.status === "success" && Response.data.messages !== "no messages")
                    this.notifs = Response.data.messages
                else if (Response.data.status === "success" && Response.data.messages === "no messages")
                    this.notifs = Response.data.messages
            })
            .catch(error => this.$router.push({name: 'login'}))
        },
    }
}
</script>

<style>

.notif.visit {
    border-left: 4px solid #3cd1c2;
}

.notif.unlike {
    border-left: 4px solid #616161;
}

.notif.rate {
    border-left: 4px solid gold;
}

.notif.like {
    border-left: 4px solid #D81B60;
}

.notif.match {
    border-left: 4px solid #7E57C2;
}

.v-chip.unlike {
    background: #616161;
}

.v-chip.visit {
    background: #3cd1c2;
}

.v-chip.rate {
    background:  gold;
}

.v-chip.like {
    background: #D81B60;
}

.v-chip.match {
    background: #7E57C2;
}

</style>

