import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8084',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)


export const authAPI = {
  register: (data) => api.post('/users', data),
  login: (data) => api.post('/users/login', data),
  getProfile: (id) => api.get(`/users/${id}`),
}

export const productAPI = {
  getAll: (page = 0, size = 20) => api.get(`/products?page=${page}&size=${size}`),
  getById: (id) => api.get(`/products/${id}`),
  search: (query, page = 0, size = 20) => api.get(`/products/search?query=${query}&page=${page}&size=${size}`),
  getByCategory: (category, page = 0, size = 10) => api.get(`/products/category/${category}?page=${page}&size=${size}`),
}

export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/user'),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status?status=${status}`),
}

export default api