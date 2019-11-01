import axios from 'axios'

export default function setHeader() {
    const token = window.localStorage.getItem('token')
    if (token){
        axios.defaults.headers.common['x-auth-token'] = token
    } else  {
        
    }

}