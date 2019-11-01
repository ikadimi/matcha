<template>
<v-container fill-height fluid grid-list-xl justify-center>
    <v-layout v-if="loader == true">
       <v-progress-circular class="mx-auto my-3"
        :size="60"
        :width="7"
        color="blue lighten-2"
        v-show="loader"
        indeterminate
        ></v-progress-circular>
    </v-layout >
    <v-layout justify-center wrap v-else>
    <v-flex xs12 md4 lg4 xl3>
      <v-flex xs12>
         <v-card align-center elevation="15" class="v-card-profile">
           <v-img
                class="white--text"
                height="150px"
                :src="backgroundImg"
              >
           <v-btn icon @click.native="searchProfile" class="justify-center remove" block flat fab depressed>

              <v-avatar class="ma-auto d-block" size="120">
                <img :src="getImageUrl">
              </v-avatar>

          </v-btn>   
           </v-img>
          <input type="file" name="myImage" id="profile-upload" style="display:none" @change="onFileLoad">
          <v-card-text class="text-xs-center">
            <h6 class="category text-gray font-weight-thin mb-3">{{userData.username}}</h6>
            <h4 class="card-title font-weight-light">{{userData.first_name}} {{userData.last_name}}</h4>
            <p class="card-description font-weight-light">{{userData.bio}}</p>
            <v-btn flat>

              <div v-for="n in 4" :key="n" >
                <v-icon color="blue lighten-2" v-if="n - 1 >= userData.fame" >star_border</v-icon>
                <v-icon color="blue lighten-2" v-else-if="n - 0.5 == userData.fame" >star_half</v-icon>
                <v-icon color="blue lighten-2" v-else >star</v-icon>
              </div>
              
            </v-btn>
          </v-card-text>
         </v-card>
         </v-flex>
          <v-flex xs12>
              <v-card align-center elevation="15" class="v-card-profile" >
                    <v-form>
                      <v-layout wrap class="mx-1">
                        <v-flex xs6>
                            <v-text-field class="purple-input" v-model="userData.username" :counter="10" label="Username" required />
                        </v-flex>
                        <v-flex xs6 >
                        <v-text-field v-model="userData.newPassword" label="New Password" :type="show2 ? 'text' : 'password'"
                              @click:append="show2 = !show2" :append-icon="show2 ? 'visibility' : 'visibility_off'"  :counter="20" required/>
                        </v-flex>
                        <v-flex xs12 >
                            <v-text-field v-model="userData.email" label="Email Address" required/>
                        </v-flex>
                        <v-flex xs12 >
                        <v-text-field  v-model="userData.currentPassword" label="Current Password" :type="show1 ? 'text' : 'password'"
                              @click:append="show1 = !show1" :append-icon="show1 ? 'visibility' : 'visibility_off'" :counter="20" required/>
                        </v-flex>
                        <v-flex xs12 text-xs-right>
                        <v-btn class="mx-0 font-weight-light white--text" :disabled="!isEmpty2" color="blue lighten-2" @click="secureUpdate">
                          SECURE UPDATE
                        </v-btn>
                        </v-flex>
                    </v-layout>
                    </v-form>
              </v-card>
         </v-flex>
      </v-flex>
        <v-flex xs12 md8 lg6 xl4>

          <v-card elevation="15" v-if="this.change === true" >
            <v-btn dark right color="blue lighten-2" @click="switchBetween">
              <v-icon>arrow_left</v-icon>
              <span class="mx-0 font-weight-light">Images</span>
            </v-btn>
            <v-form v-model="valid" ref="form" lazy-validation >
              <v-container py-0>
                <v-layout wrap>
                  <v-flex  xs12 md6>
                    <v-text-field v-model="userData.first_name" :counter="20" :rules="firstNameRules" label="First name" required class="purple-input"/>
                  </v-flex>
                  <v-flex xs12 md6>
                    <v-text-field v-model="userData.last_name" :counter="20" :rules="firstNameRules" label="Last name" required class="purple-input"/>
                  </v-flex>
                  <v-flex xs12>
                    <v-text-field label="Bio" class="purple-input" v-model="userData.bio" :counter="100" :rules="bioRules"/>
                  </v-flex>
                <v-flex xs6>

                    <v-slider v-model="userData.age" :min="18" :max="60" label="Age" thumb-color="blue lighten-2"
                      thumb-label="always"></v-slider>

                  </v-flex>

                  <v-flex xs6>

                    <v-text-field :counter="20" :rules="firstNameRules" v-model="userData.location" label="City" required/>

                  </v-flex>
                  <v-flex xs12>
                      <span class="subheading" >Background image</span>
                            <v-select
                              :items="backgrounds"
                              :label="userData.background_img" v-model="userData.background_img"
                              solo
                            ></v-select>
                  </v-flex>
                  <v-flex xs12 md6 >
                      <span class="subheading" >My Gender</span>
                      <v-radio-group row v-model="userData.myGender">
                          <v-radio v-for="gender in genders" :key="gender" :label="gender" :value="gender"></v-radio>
                      </v-radio-group>
                  </v-flex>
                  <v-flex xs12 md6 >
                      <p class="subheading">Intrest Gender</p>
                      <v-radio-group row v-model="userData.otherGender">
                          <v-radio v-for="gender in genders" :key="gender" :label="gender" :value="gender"></v-radio>
                      </v-radio-group>
                  </v-flex>
                  <v-flex xs12>
                      <v-autocomplete counter color="blue lighten-2" menu-props="offsetY" type  deletable-chips v-model="userData.tags" :items="items" chips label="Select 5 Tags" multiple outline>
                      </v-autocomplete>
                  </v-flex>
                  <v-flex xs12 text-xs-right>
                    <v-btn dark class="mx-0 font-weight-light" color="blue lighten-2" :disabled="!valid || !isEmpty" @click="emitData">
                      Update Profile
                    </v-btn>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-form>
          </v-card>

          <v-card elevation="15" v-if="this.change === false">
            <v-btn dark right color="blue lighten-2" @click="switchBetween">
              <v-icon>arrow_left</v-icon>
              <span class="mx-0 font-weight-light">Info</span>
              </v-btn>
              <v-layout wrap>
                <v-flex xs12 md6 v-for="(image, n) in userData.images" :key="n">
                  <v-card>
                  <v-img :src="image" min-height="300px" max-height="300"></v-img>
                      <v-btn v-if="image == 'uploads/placeholder.png'" color="blue lighten-2" @click.native="clickImg" dark small absolute bottom left fab>
                      <v-icon>add</v-icon>
                      </v-btn>
                      <v-btn v-else color="blue lighten-2" @click.native="deleteImg(n)" dark small absolute bottom left fab>
                      <v-icon>delete</v-icon>
                      </v-btn>
                      <input type="file" name="myImage" id="image-upload" style="display:none" @change="onImgLoad">
                  </v-card>
                </v-flex>
              </v-layout>
          </v-card>
      </v-flex>
    </v-layout>
          <v-snackbar v-model="snackbar" :color="snackColor" :timeout="5000" top class="mt-4">
          {{ text }}
          <v-btn color="white"  flat  @click="snackbar = false">
              Close
          </v-btn>
          </v-snackbar>
</v-container>
</template>

<script>
import Axios from 'axios'

export default {
    mounted() {
      this.loader = true
      setTimeout(()=>{
        this.loader = false
      }, 700);
      this.userLocation()
      this.onPageLoad()
      },
    name : "SettingsComponent",
    data() {
        return {
            backgrounds: ['docks', 'mountains', 'sunshine', 'road', 'techno', 'asakusa', '1337'],
            userData: {
              fame: 0,
              id: 0,
              age: 18,
              location: '',
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
              profile_img: "uploads/p_placeholder.png",
              background_img: 'docks',
              images: ["uploads/placeholder.png", "uploads/placeholder.png", "uploads/placeholder.png", "uploads/placeholder.png"]
            },
            snackColor: '',
            loader: false,
            tmp: null,
            count: 0,
            text: '',
            snackbar: false,
            change: true,
            dialog: false,
            valid: true,
            show1: false,
            show2: false,
            items: ["wild", "style", "food", "party", "travel", "coffee", "space", "summer", "tropical", "love"],
            add_close: 'add',
            bioRules: [
                v => (v && v.length <= 100) || 'Name must be less than 100 characters'
            ],
            genders: ["Man", "Woman", "Other"],
            valid: true,
            firstNameRules: [
                v => !!v || 'Username is required',
                v => (v && v.length <= 15) || 'Name must be less than 15 characters'
            ],
            nameRules: [
                v => !!v || 'Username is required',
                v => (v && v.length <= 15) || 'Name must be less than 15 characters'
            ],
            nameRules: [
                v => !!v || 'Username is required',
                v => (v && v.length <= 10) || 'Name must be less than 10 characters'
            ],
            passwordRules: [
                v => !!v || 'Password is required',
                v => /^[a-zA-Z0-9]{3,20}$/.test(v) || 'password must be less than 20 characters'
            ],
            emailRules: [
                v => !!v || 'E-mail is required',
                v => /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v) || 'E-mail must be valid'
            ],
            }},

    methods: {
      userLocation() {
        if (navigator.geolocation) 
        {
            navigator.geolocation.getCurrentPosition( function(position)
            {
                let coord = {latitude: position.coords.latitude, longitude: position.coords.longitude}
                Axios.post("http://localhost:3001/settings/userLocation", coord)
                .then(response => {
                })
                .catch(error => {
                  this.$router.push({name: 'login'})
                })
            }, function(error) 
            {
                Axios.get("http://localhost:3001/settings/ipAddress")
                .then(response => {
                })
                .catch(error => {
                  this.$router.push({name: 'login'})
                })
            })
        }
      },
      validate () {
          if (this.$refs.form.validate()) {
          this.snackbar = true
          }
      },
      emitData() {
        Axios.post("http://localhost:3001/settings/dataUpdate", this.userData)
        .then (response => {
          if (response.data == "Invalid token." || response.data == "No token provided")
              this.$router.push({name: 'login'})
          else if (response.data.status == "failure"){
                    this.text = response.data.msg
                    this.snackColor = 'error'
                    this.snackbar = true
                } 
          else {
                    this.text = response.data.msg
                    this.snackColor = 'success'
                    this.snackbar = true
                    this.$store.state.updated = 1
                }
        })
        .catch (err => {
          this.$router.push({name: 'login'})
        })
      },
      secureUpdate() {
        Axios.post("http://localhost:3001/settings/secureUpdate", this.userData)
        .then (response => {
          if (response.data == "Invalid token." || response.data == "No token provided")
              this.$router.push({name: 'login'})
          else if (response.data.status == "failure"){
                    this.text = response.data.msg
                    this.snackColor = 'error'
                    this.snackbar = true
                } 
          else {
                    this.text = response.data.msg
                    this.snackColor = 'success'
                    this.snackbar = true
                }
        this.userData.currentPassword = ''
        this.userData.newPassword = ''
        })
        .catch (err => {
          this.$router.push({name: 'login'})
        })
        
      },
      switchBetween() {
          this.change = !this.change
        },
      
      searchProfile(){
          document.getElementById('profile-upload').click();
      },
      onFileLoad(e) {
          const file = e.target.files[0]     
          const fd = new FormData()
          fd.append('myImage', e.target.files[0])
          Axios.post("http://localhost:3001/settings/uploadImg/1", fd)
          .then(response => {
              if (response.data == "Invalid token." || response.data == "No token provided")
                this.$router.push({name: 'login'})
              else if (response.data.status == "failure"){
                    this.text = response.data.msg
                    this.snackColor = 'error'
                    this.snackbar = true
              } 
              else if (response.data.status == "success")
              {
                  this.userData.profile_img = response.data.img
                  location.reload();
              }
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
              this.$store.state.updated = 1
            }
            this.userData = response.data.setData
            })
          .catch(error => {
                this.$router.push({name: 'login'})
            })
      },
      clickImg() {
            document.getElementById('image-upload').click();
      },
      onImgLoad(e) {
          const file = e.target.files[0]     
          const fd = new FormData()
          fd.append('myImage', e.target.files[0])
          Axios.post("http://localhost:3001/settings/uploadImg/2", fd)
          .then(response => {
              if (response.data == "Invalid token." || response.data == "No token provided")
                this.$router.push({name: 'login'})
              else if (response.data.status == "failure"){
                    this.text = response.data.msg
                    this.snackColor = 'error'
                    this.snackbar = true
              } 
              else 
              {
                    this.text = response.data.msg
                    this.snackColor = 'success'
                    this.snackbar = true
                    this.userData.images[response.data.count] = response.data.img
              }
            })
          .catch(error => {
                this.$router.push({name: 'login'})
            })
      },
      deleteImg(num) {
        Axios.post(`http://localhost:3001/settings/deleteImg/${num}`)
        .then(response => {
              if (response.data == "Invalid token." || response.data == "No token provided")
                this.$router.push({name: 'login'})
              else if (response.data.status === "success")
                this.userData.images = response.data.img
        })
        .catch(error => {
          this.$router.push({name: 'login'})
        })
      },
       reactiveImg(nbr){
          return this.userData.images[nbr]
        }

    },
      
    
    computed: {
        isEmpty() {
            return this.userData.first_name && this.userData.last_name
            && this.userData.bio && this.userData.location
            && this.userData.tags.length == 5
        },
        isEmpty2() {
          return this.userData.username && this.userData.email && this.userData.currentPassword
        },
        getImageUrl() {
              return  this.userData.profile_img
        },
        backgroundImg()
        {
          return `uploads/${this.userData.background_img}.jpg`
        }
    }
}
</script>

<style>
    .remove{
      margin: auto;
      width: 120px;
      height: 120px;
    }
    .flex.lg5-custom {
            width: 20%;
            max-width: 20%;
            flex-basis: 20%;
            height: 200px;
        }
</style>