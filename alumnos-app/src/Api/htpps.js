import axios from 'axios';

export const http = axios.create({
  
  baseURL: 'http://localhost:8081/alumnos',

  timeout: 10000,
});

// Interceptor simple de errores
http.interceptors.response.use(
  r => r,
  err => {
    
    return Promise.reject(err);
  }
);
