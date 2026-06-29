import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 15000,
  method: 'post',
})

request.interceptors.response.use(
  (res) => {
    const body = res.data
    if (body.code !== 0) {
      return Promise.reject(new Error(body.message || '请求失败'))
    }
    return body.data
  },
  (err) => Promise.reject(err)
)

export default request
