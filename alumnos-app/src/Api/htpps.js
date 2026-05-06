import axios from 'axios';
import { Platform } from 'react-native';

const LOCAL_API_BY_PLATFORM = {
  android: 'http://10.0.2.2:8081/alumnos',
  ios: 'http://localhost:8081/alumnos',
  web: 'http://localhost:8081/alumnos',
};

const BASE_URL = LOCAL_API_BY_PLATFORM[Platform.OS] ?? LOCAL_API_BY_PLATFORM.web;

export const http = axios.create({
  baseURL: BASE_URL,

  timeout: 10000,
});

// Interceptor simple de errores
http.interceptors.response.use(
  r => r,
  err => {
    
    return Promise.reject(err);
  }
);
