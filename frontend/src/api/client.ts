import axios from 'axios'

const api = axios.create({
  baseURL: 'https://pos-2dfh.onrender.com/api',
  withCredentials: true,
})

export default api
