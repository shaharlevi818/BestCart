// src/api/apiClient.ts

import axios from 'axios';

const API_BASE_URL = 'http://10.0.0.23:3000/api';
// home: 'http://192.168.50.216:3000/api';
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export default apiClient;