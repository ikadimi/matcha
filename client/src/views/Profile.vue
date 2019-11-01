<template>
<v-container fluid grid-list-xl>
    <v-layout v-if="loader == true">
       <v-progress-circular class="mx-auto my-3"
        :size="60"
        :width="7"
        color="blue lighten-2"
        v-show="loader"
        indeterminate
        ></v-progress-circular>
    </v-layout >
    <v-layout v-if="loader == false" justify-center wrap  align-content-space-around fill-height>
      <v-flex xs12 md5 lg4 xl2>
          <v-card align-center elevation="15" class="v-card-profile" >
              <v-img
                class="white--text"
                height="150px"
                :src="backgroundImg"
              >
              <v-avatar class="ma-auto pt-3 d-block" size="120">
                <img :src="userData.profile_img">
              </v-avatar>
            </v-img>
          <v-card-text class="text-xs-center">
            <h6 class="category subheading mb-3">
              <span class="mr-1">{{userData.username}}</span>
              <v-icon v-if="userData.online == 1" color="green">account_circle</v-icon>
              <span v-else-if="userData.online == 0">
                <v-icon  color="red">account_circle</v-icon>
                <p class="font-weight-thin caption">{{userData.last_connection}}</p>
                </span>
            </h6>
            <h4 class="card-title font-weight-light">{{userData.first_name}} {{userData.last_name}}</h4>
            <p class="card-description font-weight-light">{{userData.bio}}</p>
             <v-btn flat>

              <div v-for="n in 4" :key="n" >
                <v-icon color="blue lighten-2" v-if="n - 1 >= userData.fame" >star_border</v-icon>
                <v-icon color="blue lighten-2" v-else-if="n - 0.5 == userData.fame" >star_half</v-icon>
                <v-icon color="blue lighten-2" v-else >star</v-icon>
              </div>
              
            </v-btn>
              <v-btn absolute left @click="openChat()" v-if="this.$route.params.id && this.userStatus == 'matched'" color="blue lighten-2">
                <v-icon color="white">chat</v-icon>
              </v-btn>
                <v-btn absolute right @click="profileLike" v-if="this.$route.params.id && this.userStatus == 'matched'" color="blue lighten-2">
                <v-icon color="white">fas fa-heartbeat</v-icon>
              </v-btn>
              <v-btn @click="profileLike" v-else-if="this.$route.params.id"  absolute right color="blue lighten-2">
                <v-icon v-bind:style="{color: otherHeartColor}">favorite</v-icon>
                <v-icon v-bind:style="{color: heartColor}">favorite</v-icon>
              </v-btn>
          </v-card-text>
         </v-card>
      </v-flex>
      
        <v-flex xs12 md5 lg4 xl3>
              <v-card align-center elevation="15" class="v-card-profile"  height="100%">
                <v-dialog v-model="dialog" max-width="250px">
                  <v-btn slot="activator"  absolute right class="mt-1" v-if="this.$route.params.id" small  fab color="error">
                    <v-icon color="white">block</v-icon>
                  </v-btn>
                  <v-card>
                    <v-toolbar height="40px">
                      <v-icon>block</v-icon>
                      <v-toolbar-title >Are you sure?</v-toolbar-title>
                    </v-toolbar>
                      <v-card-actions>
                        <v-btn left color="red" class="white--text" @click="profileRemove">Block</v-btn>
                        <v-btn left color="green" class="white--text" @click.native="cancel">Cancel</v-btn>
                      </v-card-actions>
                  </v-card>
                </v-dialog>
                <v-dialog v-model="dialog2" max-width="250px">
                    <v-btn slot="activator" absolute right class="mt-1 mr-5" v-if="this.$route.params.id" small  fab color="warning">
                      <v-icon color="white">flag</v-icon>
                    </v-btn>
                <v-card>
                      <v-toolbar height="40px">
                      <v-icon>flag</v-icon>
                      <v-toolbar-title >Report user</v-toolbar-title>
                      </v-toolbar>
                      <v-card-actions>
                        <v-btn left color="warning" class="white--text" @click="profileReport">Report</v-btn>
                        <v-btn left color="green" class="white--text" @click.native="cancel">Cancel</v-btn>
                      </v-card-actions>
                </v-card>
                </v-dialog>
                <v-list two-line class="ma-0 pa-0">

                    <v-list-tile>
                      <v-icon > person</v-icon>
                      <v-list-tile-content class="ml-2">
                          <v-list-tile-title class="subheading" >Gender</v-list-tile-title>
                          <v-list-tile-sub-title >{{userData.myGender}}</v-list-tile-sub-title>
                      </v-list-tile-content>
                    </v-list-tile>

                    <v-list-tile>
                      <v-icon > location_searching</v-icon>
                      <v-list-tile-content class="ml-2">
                          <v-list-tile-title class="subheading" >Intrest</v-list-tile-title>
                          <v-list-tile-sub-title >{{userData.otherGender}}</v-list-tile-sub-title>
                      </v-list-tile-content>
                      </v-list-tile>

                      <v-list-tile>
                      <v-icon > hourglass_empty</v-icon>
                      <v-list-tile-content class="ml-2">
                          <v-list-tile-title class="subheading" >Age</v-list-tile-title>
                          <v-list-tile-sub-title >{{userData.age}}</v-list-tile-sub-title>
                      </v-list-tile-content>
                    </v-list-tile>
                    
                     <v-list-tile v-if="this.$route.params.id">
                      <v-icon > location_on</v-icon>
                      <v-list-tile-content class="ml-2">
                          <v-list-tile-title class="subheading" >City</v-list-tile-title>
                          <v-list-tile-sub-title >{{userData.location}}</v-list-tile-sub-title>
                      </v-list-tile-content>
                    </v-list-tile>
                    
                    <v-list-tile v-else>
                      <v-dialog v-model="dialog3" max-width="500px" block color="grey lighten-3">
                          <v-btn @click="userLocationF" round large right slot="activator" class="blue--text">Change my GPS Location</v-btn>
                          <v-card>
                            <v-form class="pa-3">
                              <v-text-field v-model="userLocation.latitude" label="Latitude"></v-text-field>
                              <v-text-field v-model="userLocation.longitude" label="Longitude"></v-text-field>
                              <v-switch v-model="userLocation.autoLocation" flat label="Auto Position"></v-switch>
                              <v-btn @click="newPos" block width="100%" color="grey darken-4" class="blue--text">Submit New Position</v-btn>
                            </v-form>
                          </v-card>
                         
                        </v-dialog>
                      </v-list-tile>
          
                </v-list>
              </v-card>
              </v-flex>

    </v-layout>
    <v-layout v-if="loader == false" justify-center wrap class="mt-4" align-content-space-around fill-height>
      <v-flex xs12 md5 lg4 xl2>
      <v-card align-center elevation="5"  class="v-card-profile">
        <v-toolbar height="50px"  color="grey darken-4" dark>
          <v-icon >favorite</v-icon>
          <v-toolbar-title>Intrests</v-toolbar-title>
        </v-toolbar>
          <v-card-text v-for="tag in userData.tags" :key="tag">
                <v-img aspect-ratio="3" max-height="65" class="ma-auto" :alt="tag.name" :src="tagFix(tag)"></v-img>
          </v-card-text>
      </v-card>
      </v-flex>
      <v-flex xs12 md5 lg4 xl3>
      <v-card  align-center elevation="5"  class="v-card-profile" height="100%">
           <v-toolbar  height="50px" color="grey darken-4"  dark>
            <v-icon >add_a_photo</v-icon>
            <v-toolbar-title>Gallery</v-toolbar-title>
            </v-toolbar>
          <v-card-text>
                  <v-carousel height="450px" show-arrows-on-hover>
                      <v-carousel-item v-for="(image, n) in userData.images"  :src="image" :key="n">  
                  </v-carousel-item>
              </v-carousel>
          </v-card-text>
      </v-card>
      </v-flex>
    </v-layout >
      <v-dialog max-width="600px">
          <v-btn id="mbrok" block slot="activator" style="display: none" color="pink" dark></v-btn>
          <v-card class="ma-auto" >
                <v-img class="white--text" height="400px" src="uploads/match.gif">
                <v-card-title class="ma-auto display-3 justify-center">IT'S A MATCH</v-card-title>
              </v-img>
          </v-card>
      </v-dialog>
      <v-dialog max-width="600px">
          <v-btn id="divorce" block slot="activator" style="display: none" color="pink" dark></v-btn>
          <v-card class="ma-auto" >
                <v-img class="white--text" height="400px" src="uploads/divorce.gif">
              </v-img>
          </v-card>
      </v-dialog>
      <v-dialog max-width="600px" scrollable id="dialog">
          <v-btn id="chat" block slot="activator" style="display: none" color="pink" dark></v-btn>
              <Chatbox :messages="messages" :info="info" :profile_img="userData.profile_img" :connected_id="connected_id" @newMessage="addMsg"></Chatbox>
      </v-dialog>
      <v-snackbar v-model="snackbar" :timeout="3000" color="error" top class="mt-4">
            You need to have at least one picture
        <v-btn color="white"  flat  @click="snackbar = false">
            Close
        </v-btn>
    </v-snackbar>
</v-container>
</template>

<script>
import Axios from 'axios'
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
      this.loader = true
      setTimeout(()=>{
        this.loader = false
      }, 700);
      if (this.$route.params.id)
      {
        this.addHistory()
        this.checkStatus()
        this.visitorLoad()
      } 
      else
        this.onPageLoad()
      },
    data() {
        return {
            loader: false,
            dialog: false,
            dialog2: false,
            dialog3: false,
            snackbar: false,
            visitorId: -1,
            userLocation: {
              autoLocation: 1,
              latitude: '',
              longitude:'',
            },
            info: {
                username_to: '',
                user_from: '',
                user_to: '',
            },
            messages: [],
            connected_id: '',
            userStatus: 'nop',
            userData: {
                id: 0,
                age: 18,
                location: 'unknown',
                username: '',
                first_name: '',
                last_name: '',
                email: '',
                newPassword: '',
                currentPassword: '',
                bio: 'Life goes so fast that you dont realise waht you missed',
                myGender: 'Other',
                otherGender: 'Other',
                tags: [],
                profile_img: "uploads/placeholder.png",
                background_img: 'docks',
                online: 0,
                last_connection: 0,
                images: ["uploads/placeholder.png", "uploads/placeholder.png", "uploads/placeholder.png", "uploads/placeholder.png"]
            },
          }
      },

      methods: {
        cancel() {
          this.dialog = false
          this.dialog2 = false
        },
        profileReport(id)
        {
          Axios.post("http://localhost:3001/profile/reportUser", {reportedId: this.$route.params.id})
            .then (Response => {
              if (Response.data == "Invalid token." || Response.data == "No token provided")
                  this.$router.push({name: 'login'})
            })
            .catch(error => {
               this.$router.push({name: 'login'})
            })
            this.dialog2 = false
        },
        addMsg(msg)
        {
            this.messages.push(msg)
        },
        openChat() {
            document.getElementById('chat').click();
            this.info.user_to = this.$route.params.id
            this.info.username_to = this.userData.username
            this.connected_id = this.$route.params.id
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
            const token = window.localStorage.getItem('token')
            if (token) Axios.defaults.headers.common['x-auth-token'] = token
            else delete Axios.defaults.headers.common['x-auth-token']
            Axios.post("http://localhost:3001/openChat", {matchId: this.info.user_to})
            .then (Response => {
                if (Response.data == "Invalid token." || Response.data == "No token provided")
                    this.$router.push({name: 'login'})
                else if (Response.data === "Empty")
                    this.message = "No Message between the two of you"
                else
                    this.messages = Response.data
            })
            .catch(error => {
                this.$router.push({name: 'login'})
            })
        },
        addHistory() {
            const token = window.localStorage.getItem('token')
            if (token) Axios.defaults.headers.common['x-auth-token'] = token
            else delete Axios.defaults.headers.common['x-auth-token']
            Axios.post("http://localhost:3001/profile/addHistory", {visitedId: this.$route.params.id})
            .then (Response => {
                if (Response.data == "Invalid token." || Response.data == "No token provided")
                    this.$router.push({name: 'login'})
                else if (Response.data == "blocked")
                    this.$router.push({ name: 'matches' });
            })
            .catch(error => {
                this.$router.push({name: 'login'})
            })
        },
        profileRemove(removedId) {
            const token = window.localStorage.getItem('token')
            if (token) Axios.defaults.headers.common['x-auth-token'] = token
            else delete Axios.defaults.headers.common['x-auth-token']
            Axios.post("http://localhost:3001/matches/blockUser", {removedId: this.$route.params.id, status: "profile"})
            .then (Response => {
                if (Response.data == "Invalid token." || Response.data == "No token provided")
                    this.$router.push({name: 'login'})
                else
                    this.$router.push({name: 'matches'})
                this.dialog = false
            })
            .catch(error => {
                this.$router.push({name: 'login'})
            })
        },
        profileLike(likedId) {
            Axios.post("http://localhost:3001/matches/profileLike", {likedId: this.$route.params.id})
            .then (Response => {
                if (Response.data == "Invalid token." || Response.data == "No token provided")
                    this.$router.push({name: 'login'})
                if (Response.data === "zero")
                    this.snackbar = true
                else if (Response.data === "mbrok")
                {
                  document.getElementById('mbrok').click();
                  this.userStatus = "matched"
                }
                else if (Response.data === "like")
                  this.userStatus = "liked"
                else if (Response.data === "unlike" )
                  this.userStatus = "nop"
                else if (Response.data === "divorced")
                {
                  document.getElementById('divorce').click();
                  this.userStatus = "other_liked"
                }
            })
            .catch(error => {
                this.$router.push({name: 'login'})
            })
        },
        checkStatus() {
            Axios.post("http://localhost:3001/profile/profileStatus", {visitedId: this.$route.params.id})
            .then(response => {
               if (response.data == "Invalid token." || response.data == "No token provided")
                    this.$router.push({name: 'login'})
              else
                this.userStatus = response.data
              })
            .catch(error => {
                 this.$router.push({name: 'login'})
              })
        },
        visitorLoad()
        {
          Axios.post("http://localhost:3001/profile/profileVisit", {visitorId: this.$route.params.id})
          .then(response => {
            this.userData = response.data.setData
            })
          .catch(error => {
                this.$router.push({name: 'login'})
            })
        },
        onPageLoad() {
          Axios.get("http://localhost:3001/settings/pageLoad")
          .then(response => {
            if (response.data == "Invalid token." || response.data == "No token provided")
               this.$router.push({name: 'login'})
            if (response.data.msg === "all good"){
              this.$store.dispatch('userUpdated')
            }
            this.userData = response.data.setData
            })
          .catch(error => {
                this.$router.push({name: 'login'})
            })
        },
        tagFix(name) {
          return `images/${name}.png`
        },
        userLocationF() {
          Axios.get("http://localhost:3001/profile/userLocation")
          .then(response => {
            if (response.data == "Invalid token." || response.data == "No token provided")
                    this.$router.push({name: 'login'})
            else if (response.data !== "locationquery didn't deliver")
              this.userLocation = response.data
            })
          .catch(error => {
                this.$router.push({name: 'login'})
            })
        },
        newPos() {
          Axios.post("http://localhost:3001/profile/newPos", this.userLocation)
          .then(response => {
              if (response.data == "Invalid token." || response.data == "No token provided")
                    this.$router.push({name: 'login'})
            })
          .catch(error => {
                this.$router.push({name: 'login'})
            })
            this.dialog3 = false
        }
      },

      computed: {
        backgroundImg()
        {
          return `uploads/${this.userData.background_img}.jpg`
        },
        heartColor()
        {
          if (this.userStatus == 'liked')
            return ("#FF69B4")
          else
            return ("white")
        },
        otherHeartColor()
        {
          if (this.userStatus == 'other_liked')
            return ("#FF69B4")
          else
            return ("white")
        }
      },
      watch: {
      },
}
</script>

<style>
    .flex.lg5-custom {
            width: 20%;
            max-width: 20%;
            flex-basis: 20%;
            height: 200px;
        }
</style>



