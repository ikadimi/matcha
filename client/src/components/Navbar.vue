<template>
<nav style="z-index: 999;">
  <v-toolbar dark color="darken-4 dark" app height="60">
      <v-toolbar-side-icon @click="loadinfo()" ></v-toolbar-side-icon>
      <v-toolbar-title class="white--text">Matcha</v-toolbar-title>
    <v-spacer></v-spacer>

        <!-- drop down menu for notifications -->
    <v-menu close-delay offset-y >
        <v-btn flat @click="loadMsgs" slot="activator" x-small round class="mx-0 px-0">
            <v-badge overlap color="red lighten-2">
                <template v-if="messageCount > 0" v-slot:badge><span>!</span></template>
                <v-icon>chat</v-icon>
            </v-badge>
        </v-btn>
        <v-list v-if="messages == 'no messages'">
            <p class="ma-1">You have no messages yet</p>
        </v-list>
        <v-list v-else>
            <v-card flat tile="" class="pa-2" v-for="(message, n) in messages" :key="n">
                <v-layout style="cursor: pointer" @click="goToProfile(message.id)">
                    <v-avatar size="30px" class="mb-2 mx-1">
                            <img :src="message.profile_img" alt="">
                    </v-avatar>
                    <strong class="pr-1">{{message.username}}</strong>
                    <p>Sent you a message </p>
                    <p class="ml-1 grey--text">{{ TIME(message.time) }}</p>
                </v-layout>
                 <v-divider class="ma-0"></v-divider>
            </v-card>
             <v-btn block color="blue lighten-2" dark to="/matches">
                <span>Go to matches</span>
            </v-btn>
        </v-list>
    </v-menu>
    <v-menu close-delay offset-y >
        <v-btn @click="loadNotifs" flat slot="activator" class="mx-0 px-0" round>
            <v-badge overlap color="red lighten-2">
                <template v-if="notifNum > 0" v-slot:badge><span>!</span></template>
                <v-icon >notifications</v-icon>
            </v-badge>
        </v-btn>
        <v-list v-if="notifs == 'no messages'">
            <p class="ma-1">You have no notifications yet</p>
        </v-list>
        <v-list v-else>
            <v-card flat tile="" class="pa-2" v-for="(notif, n) in notifs" :key="n">
                <v-layout style="cursor: pointer" @click="goToProfile(notif.id)">
                    <v-avatar size="30px" class="mb-2 mx-1">
                            <img :src="notif.profile_img" alt="">
                    </v-avatar>
                    <strong class="pr-1">{{notif.username}}</strong>
                    <p>{{ notifAction(notif.action) }}</p>
                    <p class="ml-1 grey--text">{{ TIME(notif.time) }}</p>
                </v-layout>
                 <v-divider class="ma-0"></v-divider>
            </v-card>
            <v-btn block color="blue lighten-2" dark to="/notif">
            <span>See all</span>
        </v-btn>
        </v-list>
        
    </v-menu>

    <v-toolbar-items>
     <socketco></socketco>
      <v-btn @click="logoutUser" flat >
          <span>Sign Out</span>
          <v-icon  right>exit_to_app</v-icon>
      </v-btn>
    </v-toolbar-items>
  </v-toolbar>

    <v-navigation-drawer v-model="drawer" app dark class="grey darken-4"  disable-resize-watcher>
        <v-list dense nav>
        <v-list-tile class="py-4">
            <v-avatar class="ma-2" size="80">
                    <img :src="userData.profile_img" alt="">
            </v-avatar>
        <v-list-tile-content class="ml-2">
            <v-list-tile-title class="subheading" >{{userData.username}}</v-list-tile-title>
            <v-list-tile-sub-title >{{userData.first_name}} {{userData.last_name}}</v-list-tile-sub-title>
        </v-list-tile-content>
         </v-list-tile>

          <v-divider></v-divider>

            <v-list-tile v-for="link in links" :key="link.text" router :to="link.route">
                <v-list-tile-action>
                    <v-icon>{{link.icon}}</v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                    <v-list-tile-title >{{link.text}}</v-list-tile-title>
                </v-list-tile-content>
            </v-list-tile>
        </v-list>
    </v-navigation-drawer>
  </nav>
</template>

<script>
import Axios from 'axios'
import socketco from '@/components/socket_co'
import Moment from 'moment'

export default {
    mounted() {
        this.$store.state.socket.on('Notifications', (data) => {
            this.notifNum = 1
        })
        this.$store.state.socket.on('first_Notifications', (data) => {
                this.$store.state.socket.emit('Notifications', data)
        })
        this.$store.state.socket.on('MESSAGE', (data) => {
           this.messageNum = 1
        });
        this.getMsgNum()
        this.getNotifNum()
    },
    components: {
        socketco,
    },
    data() {
        return {
            userData: {
                username: '',
                first_name: '',
                last_name: '',
                profile_img: '',
            },
            drawer: false,
            connectedId: -1,
            notifNum: 0,
            messageNum: 0,
            messages: null,
            notifs: null,
            nothing: 'You have no messages',
            links: [
                { icon: 'person', text: 'Profile', route: '/profile' },
                { icon: 'favorite', text: 'Matches', route: '/matches' },
                { icon: 'fa-user-slash', text: 'Blocked', route: '/blocked' },
                { icon: 'notifications', text: 'Notifications', route: '/notif' },
                { icon: 'settings', text: 'Settings', route: '/settings' },
                { icon: 'history', text: 'History', route: '/history' }
            ],
        }
    },
    methods: {
        loadinfo()
        {
            if (this.drawer == false)
            {
                Axios.get("http://localhost:3001/profile/loadInfo")
                .then(Response => {
                    if (Response.data == "Invalid token." || Response.data == "No token provided" || Response.data.status == "failure")
                        this.$router.push({name: 'login'})
                    else if (Response.data.status == "success")
                        this.userData = Response.data.msg
                })
                .catch(error => console.log(error))
            }
            this.drawer = !this.drawer
        },
        goToProfile(userid)
        {
            this.$router.push({name: 'profile', params: {id : userid}})
        },
        notifAction(act) {
            if (act === "visit")
                return "Visited your profile"
            if (act === "like")
                return "Liked your profile"
            if (act === "unlike")
                return "Unliked your profile"
            if (act === "match")
                return "Matched with you"
        },
        getMsgNum() {
            Axios.get("http://localhost:3001/inbox/msgNotificationNum")
            .then(Response => {
                if (Response.data == "Invalid token." || Response.data == "No token provided")
                    this.$router.push({name: 'login'})
                this.messageNum = Response.data.num.number
            })
            .catch(error => console.log(error))
        },
         getNotifNum() {
            Axios.get("http://localhost:3001/inbox/NotificationNum")
            .then(Response => {
                if (Response.data == "Invalid token." || Response.data == "No token provided")
                    this.$router.push({name: 'login'})
                else
                    this.notifNum = Response.data.num.number
            })
            .catch(error => console.log(error))
        },
        loadNotifs() {
            Axios.post("http://localhost:3001/inbox/loadNotification", {msg: "nav"})
            .then(Response => {
                if (Response.data == "Invalid token." || Response.data == "No token provided")
                    this.$router.push({name: 'login'})
                else if (Response.data.status === "success" && Response.data.messages !== "no messages")
                    this.notifs = Response.data.messages
                else if (Response.data.status === "success" && Response.data.messages === "no messages")
                    this.notifs = Response.data.messages
                else
                    console.log("Failure")
                console.log(Response.data.messages)
                this.notifNum = 0
            })
            .catch(error => console.log(error))
        },
        loadMsgs() {
            Axios.get("http://localhost:3001/inbox/msgNotification")
            .then(Response => {
                if (Response.data == "Invalid token." || Response.data == "No token provided")
                    this.$router.push({name: 'login'})
                else if (Response.data.status === "success" && Response.data.messages !== "no messages")
                    this.messages = Response.data.messages
                else if (Response.data.status === "success" && Response.data.messages === "no messages")
                    this.messages = Response.data.messages
                else
                    console.log("Failure")
                console.log(Response.data.messages)
                this.messageNum = 0
            })
            .catch(error => console.log(error))
        },
        logoutUser() {
            Axios.get("http://localhost:3001/inbox/userData")
            .then(Response => 
                 Axios.post("http://localhost:3001/login/logout", {id: Response.data.id})
                .then(Response => {
                    if (Response.data == "Invalid token." || Response.data == "No token provided")
                        this.$router.push({name: 'login'})
                    else if (Response.data.status == "success")
                    {
                        this.$store.state.socket.emit('loggout', Response.data.id)
                        window.localStorage.removeItem('token');
                        this.$store.dispatch("userLoggedOut");
                        this.$router.push({name: 'login'})
                    }
                })
                .catch(error => console.log(error))
            )
            .catch(error => console.log(error))
        },
         TIME(time)
        {
            if (time)
                return Moment(time).format("HH:mm:ss");
        },
    },
    computed: {
        messageCount() {
            return (this.messageNum)
        }
    }
}
</script>
