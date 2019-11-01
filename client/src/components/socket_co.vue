<template>
    <div></div>
</template>


<script>
import Axios from 'axios'

export default {
    name: 'socketco',
    mounted() {
        const token = window.localStorage.getItem('token')
        if (token) Axios.defaults.headers.common['x-auth-token'] = token
        else delete Axios.defaults.headers.common['x-auth-token']
        Axios.get("http://localhost:3001/inbox/userData")
        .then(Response => {
            console.log(Response.data.id)
            this.$store.state.socket.emit('newUser', Response.data.id)}
            )
        .catch(error => console.log(error))
    },
    data() {
        return {
        }
    },
}
</script>
