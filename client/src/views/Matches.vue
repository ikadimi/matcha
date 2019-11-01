<template>
    <div class="matches">

        <v-container class="my-3" grid-list-xl text-center>
            <v-layout  justify-space-around wrap>
               <v-flex xs6>
                    <v-dialog max-width="800px">
                        <v-btn @click="loadMatches" block slot="activator" color="pink" dark>
                            <v-icon left>favorite</v-icon>
                            <span>Find a Match</span>
                            </v-btn>
                        <v-card color="#FAFAFA" width="100%" min-height="300px">
                            <v-toolbar class="text-xs-center" height="50px" width="100%" color="grey darken-4" dark>
                            <v-icon left>favorite</v-icon>
                            <v-toolbar-title >SUITED MATCHES</v-toolbar-title>
                            </v-toolbar>
                            <v-layout  wrap>
                                <h2 class="text-xs mx-auto my-3" v-if="msg != null && loader == false">{{msg}}</h2>
                            <v-flex v-if="msg == null" xs12>
                                <v-layout>
                                <v-flex xs12  sm6 md3>
                                    <v-btn @click="sortByDistance" block slot="activator" color="blue lighten-2" dark>
                                    <v-icon left>autorenew</v-icon>
                                    <span>Sort by distance</span>
                                    </v-btn>
                                </v-flex>
                                <v-flex xs12  sm6 md3>
                                    <v-btn @click="sortByAge" block slot="activator" color="blue lighten-2" dark>
                                    <v-icon left>autorenew</v-icon>
                                    <span>Sort by age</span>
                                    </v-btn>
                                </v-flex>
                                <v-flex xs12  sm6 md3>
                                    <v-btn @click="sortByFame" block slot="activator" color="blue lighten-2" dark>
                                    <v-icon left>autorenew</v-icon>
                                    <span>Sort by fame</span>
                                    </v-btn>
                                </v-flex>
                                <v-flex xs12  sm6 md3>
                                    <v-btn @click="sortByTags" block slot="activator" color="blue lighten-2" dark>
                                    <v-icon left>autorenew</v-icon>
                                    <span>Sort by Tags</span>
                                    </v-btn>
                                </v-flex>
                            </v-layout>
                            </v-flex>
                                    <v-progress-circular class="mx-auto my-3"
                                    :size="120"
                                    :width="7"
                                    color="blue lighten-2"
                                    v-show="loader"
                                    indeterminate
                                    ></v-progress-circular>
                            <v-flex class="py-2" v-show="msg == null && loader == false" xs12  sm6 md4 lg3 v-for="choice in choices" :key="choice.username">
                                <v-card color="" flat class="text-xs-center ma-1" min-width="220px">
                                    <v-img @click="goToProfile(choice.id)"
                                        style="cursor: pointer"
                                        class="white--text"
                                        height="250"
                                        :src="choice.profile_img"
                                        >
                                     <v-card-title class="align-end fill-height title font-weight-light">{{ choice.username }} {{ choice.age }}</v-card-title>
                                    </v-img>
                                    <v-card-text style="margin: 0;padding: 0">
                                        <div class="font-weight-thin">{{ choice.bio }}</div>
                                        <v-btn flat right>
                                            <v-icon class="pb-2">location_on</v-icon>
                                            <p class="mt-2">{{Math.floor(choice.distance)}} Kilometers Away</p>
                                        </v-btn>
                                    </v-card-text>
                                    <v-card-actions class="ma-0">
                                        <v-btn @click="profileRemove(choice.id)"  flat color="">
                                            <v-icon color="black">delete_forever</v-icon>
                                        </v-btn>
                                        <v-spacer></v-spacer>
                                         <v-btn @click="profileLike(choice.id)" flat color="">
                                            <v-icon color="pink">favorite</v-icon>
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-flex>
                        </v-layout>
                        </v-card>
                    </v-dialog>
                </v-flex>
                <v-dialog max-width="600px">
                    <v-btn id="mbrok" block slot="activator" color="pink" style="display: none" dark></v-btn>
                    <v-card class="ma-auto">
                         <v-img
                            class="white--text"
                            height="400px"
                            src="uploads/match.gif"
                        >
                        <v-card-title class="ma-auto display-3 justify-center">IT'S A MATCH</v-card-title>
                        </v-img>
                    </v-card>
                </v-dialog>
                <v-flex xs6>
                    <v-dialog v-model="dialog" max-width="500px" >
                        
                        <v-btn @click="loadPref" block slot="activator" color="blue lighten-2" dark>
                            <v-icon left>settings</v-icon>
                            <span>Add Prefrences</span>
                            </v-btn>
                        <v-card color="#FAFAFA" class="text-xs-center">
                            <v-toolbar class="text-xs-center" height="50px" color="grey darken-4" dark>
                            <v-icon left>settings</v-icon>
                            <v-toolbar-title >Adjust Your Prefrences</v-toolbar-title>
                            </v-toolbar>
                                    <v-slider class="mx-4" v-model="pref.ageGap" :min="1" :max="20" label="Age gap" thumb-color="blue lighten-2"
                                    thumb-label="always"></v-slider>
                                    <v-slider class="mx-4" v-model="pref.distance" :min="1" :max="100" label="Distance" thumb-color="blue lighten-2"
                                    thumb-label="always"></v-slider>
                                    <v-slider class="mx-4" v-model="pref.fameGap" :min="1" :max="4" label="Fame gap" thumb-color="blue lighten-2"
                                    thumb-label="always"></v-slider>
                                    <v-slider class="mx-4" v-model="pref.tagNumber" :min="1" :max="5" label="Tag Number" thumb-color="blue lighten-2"
                                    thumb-label="always"></v-slider>
                                    <v-btn @click="submitPref" width="70%" color="blue lighten-2" dark>Submit Changes</v-btn>
                        </v-card>
                    </v-dialog>
                </v-flex>
            </v-layout>
            <v-layout row wrap v-if="this.matches">
                <v-flex xs12 sm6 md4 lg3  v-for="match in matches" :key="match.username">
                    <v-card flat class="text-xs-center ma-3">
                        <v-responsive class="pt-4">
                            <v-avatar size="100" class="grey lighten-2" style="cursor: pointer">
                                <img :src="match.img" @click="goToProfile(match.id)" alt="">
                            </v-avatar>
                        </v-responsive>
                        <v-card-text>
                            <div class="subheading font-weight-bold">{{ match.username }}</div>
                            <div class="font-weight-thin">{{ match.bio }}</div>
                            <div >{{ match.age }}</div>
                        </v-card-text>
                        <v-card-actions>
                            <v-btn @click="openChat(match.id, match.username, match.img)" flat color="grey">
                                <v-icon v-if="match.online == 1" color="green" small left>message</v-icon>
                                <v-icon v-else-if="match.online == 0" color="red" small left>message</v-icon>
                                <span>Message</span>
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-flex>
            </v-layout>
            <v-dialog max-width="600px" scrollable id="dialog">
                <v-btn id="chat" block slot="activator" color="pink" style="display: none" dark></v-btn>
                    <Chatbox :messages="messages" :info="info" :profile_img="profile_img" :connected_id="connected_id" @newMessage="addMsg"></Chatbox>
            </v-dialog>
            <v-snackbar v-model="snackbar" :timeout="3000" color="error" top class="mt-4">
                    You need to have at least one picture
                <v-btn color="white"  flat  @click="snackbar = false">
                    Close
                </v-btn>
            </v-snackbar>
        </v-container>
    </div>
</template>

<script>
import Axios from 'axios'
import Moment from 'moment'
import Chatbox from '@/components/Chatbox'

export default {
    components: {
        Chatbox,
    },
    mounted() {
        this.$store.state.socket.on('MESSAGE', (data) => {
            if (data.id_to === this.info.user_from && data.id_from === this.info.user_to)
                this.messages = [...this.messages, data];
        });
        this.oldMatches()
    },
    data() {
        return {
            dialog: false,
            snackbar: false,
            loader: false,
            msg: null,
            message_sent: '',
            message: '',
            connected_id: '',
            profile_img: '',
            info: {
                username_to: '',
                user_from: '',
                user_to: '',
            },
            pref: {
                ageGap: 20,
                distance: 100,
                fameGap: 4,
                tagNumber: 1,
            },
            matches: null,
            choices: [],
            messages: [],
        }
    },
    methods: {
        addMsg(msg)
        {
            this.messages.push(msg)
        },
        openChat(matchId, matchName, img) {
            document.getElementById('chat').click();
            this.info.user_to = matchId
            this.info.username_to = matchName
            this.connected_id = matchId
            this.profile_img = img
            this.loadpage()
            this.getMessages()
        },
        loadpage() {
            Axios.get("http://localhost:3001/inbox/userData")
            .then (Response => {
                if (Response.data == "Invalid token." || Response.data == "No token provided")
                    this.$router.push({name: 'login'})
                else
                    this.info.user_from = Response.data.id
            })
            .catch(error => {
                this.$router.push({name: 'login'})
            })
        },
        getMessages()
        {
            Axios.post("http://localhost:3001/openChat", {matchId: this.info.user_to})
            .then (Response => {
                if (Response.data == "Invalid token." || Response.data == "No token provided")
                    this.$router.push({name: 'login'})
                if (Response.data === "Empty")
                    this.message = "No Message between the two of you"
                else
                    this.messages = Response.data
            })
            .catch(error => {
                this.$router.push({name: 'login'})
            })
        },
        oldMatches() {
            Axios.get("http://localhost:3001/matches/oldMatches")
            .then (Response => {
                if (Response.data == "Invalid token." || Response.data == "No token provided")
                    this.$router.push({name: 'login'})
                if (Response.data.status === "success" && Response.data.matches != "No matches")
                {
                    this.matches = Response.data.matches
                }
                else
                    this.matches = null
            })
            .catch(error => {
               this.$router.push({name: 'login'})
            })
        },
        profileRemove(removedId) {
            Axios.post("http://localhost:3001/matches/blockUser", {removedId: removedId, status: "search"})
            .then (Response => {
                if (Response.data == "Invalid token." || Response.data == "No token provided")
                    this.$router.push({name: 'login'})
                if (Response.data === "blocked")
                {
                    this.choices = this.choices.filter(choice => choice.id != removedId)
                }
            })
            .catch(error => {
                this.$router.push({name: 'login'})
            })
        },
        profileLike(likedId) {
            Axios.post("http://localhost:3001/matches/profileLike", {likedId: likedId})
            .then (Response => {
                if (Response.data == "Invalid token." || Response.data == "No token provided")
                    this.$router.push({name: 'login'})
                if (Response.data === "zero")
                    this.snackbar = true
                else if (Response.data === "mbrok")
                {
                    document.getElementById('mbrok').click();
                    this.oldMatches()
                }
            })
            .catch(error => {
                this.$router.push({name: 'login'})
            })
        },
        submitPref() {
            Axios.post("http://localhost:3001/matches/userPref", this.pref)
            .then (Response => {
                if (Response.data == "Invalid token." || Response.data == "No token provided")
                    this.$router.push({name: 'login'})
            })
            .catch(error => {
                this.$router.push({name: 'login'})
            })
            this.dialog = false
        },
        loadMatches() {
            this.loader = true
            setTimeout(()=>{
            this.loader = false
            }, 500);
            Axios.get("http://localhost:3001/matches/loadMatches")
            .then (Response => {
                if (Response.data == "Invalid token." || Response.data == "No token provided")
                    this.$router.push({name: 'login'})
                if (Response.data === "no matches found")
                    this.msg = "No matches found"
                else
                {
                    this.choices = Response.data
                    this.msg = null
                }
                this.dialog = false
            })
            .catch(error => {
                this.$router.push({name: 'login'})
            })
        },
        goToProfile(userid)
        {
            this.$router.push({name: 'profile', params: {id : userid}})
        },
        loadPref() {
            Axios.get("http://localhost:3001/matches/loadPref")
            .then(Response => {
                if (Response.data == "Invalid token." || Response.data == "No token provided")
                    this.$router.push({name: 'login'})
                if (Response.data !== "prefQuery didn't deliver")
                    this.pref = Response.data
            })
            .catch(error => {
                this.$router.push({name: 'login'})
            })
            
        },
        sortByAge()
        {
             Axios.post("http://localhost:3001/matches/sortByAge", this.choices)
            .then(Response => {
                if (Response.data == "Invalid token." || Response.data == "No token provided")
                    this.$router.push({name: 'login'})
                if (Response.data.status === "success")
                    this.choices = Response.data.choices
            })
            .catch(error => {
                this.$router.push({name: 'login'})
            })
        },
        sortByDistance()
        {
             Axios.post("http://localhost:3001/matches/sortByDistance", this.choices)
            .then(Response => {
                if (Response.data == "Invalid token." || Response.data == "No token provided")
                    this.$router.push({name: 'login'})
                if (Response.data.status === "success")
                    this.choices = Response.data.choices
            })
            .catch(error => {
                this.$router.push({name: 'login'})
            })
        },
        sortByFame()
        {
             Axios.post("http://localhost:3001/matches/sortByFame", this.choices)
            .then(Response => {
                if (Response.data == "Invalid token." || Response.data == "No token provided")
                    this.$router.push({name: 'login'})
                if (Response.data.status === "success")
                    this.choices = Response.data.choices
            })
            .catch(error => {
                this.$router.push({name: 'login'})
            })
        },
        sortByTags()
        {
             Axios.post("http://localhost:3001/matches/sortByTags", this.choices)
            .then(Response => {
                if (Response.data == "Invalid token." || Response.data == "No token provided")
                    this.$router.push({name: 'login'})
                if (Response.data.status === "success")
                    this.choices = Response.data.choices
            })
            .catch(error => {
                this.$router.push({name: 'login'})
            })
        },
    },
}
</script>

<style>
.v-dialog:not(.v-dialog--fullscreen) {
    max-height: 500px !important;
    
}
</style>
