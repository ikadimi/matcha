<template>
    <v-card  scroll id="box">
        <v-toolbar height="50px"  color="grey darken-4">
        </v-toolbar>
            <v-card-title style="position:fixed;">
                <v-avatar size="28px">
                    <v-img :src="this.profile_img"></v-img>
                </v-avatar>
                <span class="pl-2 font-italic font-weight-bold white--text">  {{upperName(info.username_to)}}</span>
            </v-card-title>
            <v-card-text  id="scroll">

                <div class="messages" v-for="(msg, index) in messages" :key="index">
                <p v-if="msg.id_from == connected_id" class="text-xs-left"><v-chip color="green" >{{ msg.message }}</v-chip>
                <br>
                <span class="grey--text">{{msg.time}}</span>
                </p> 
                <p v-else class="text-xs-right"><v-chip  color="blue" >{{ msg.message }}</v-chip>
                <br>
                <span class="grey--text">{{msg.time}}</span>
                </p>   
            </div>

            </v-card-text>
                <v-form class="mx-2" height="20px" @submit.prevent="sendMessage">
                    <v-layout wrap>
                    <v-flex xs10>
                        <v-text-field v-model="message_sent"  label="MESSAGE" required />
                    </v-flex>
                    <v-flex xs2 >
                        <v-btn flat class="mt-3" type="submit" id="element">
                            <v-icon>send</v-icon>
                        </v-btn>
                    </v-flex>
                    </v-layout>
        </v-form>
    </v-card> 
</template>

<script>
import Axios from  'axios'
import Moment from 'moment'

export default {
    components: {
    },
    name: 'Chatbox',
    props: {
        messages: {},
        info: {},
        profile_img: '',
        connected_id: '',
    },
    data() {
        return {
            message: '',
            message_sent: '',
        }
    },
    methods: {
        upperName(name) {
            return name.toUpperCase();
        },
        sendMessage(e) {
            e.preventDefault();
            if (this.message_sent != '')
            {
                this.$store.state.socket.emit('SEND_MESSAGE', {
                    message: this.message_sent,
                    id_to: this.info.user_to,
                    id_from: this.info.user_from,
                    time: Moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                });
                this.$emit("newMessage", {
                    message: this.message_sent,
                    id_to: this.info.user_to,
                    id_from: this.info.user_from,
                    time: Moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
                })
                this.message_sent = ''
                // var messageBody = document.querySelector('#scroll');
                // messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;
            }
        },
    }

}
</script>