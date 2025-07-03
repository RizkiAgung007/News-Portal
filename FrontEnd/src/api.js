import axios from 'axios';

export const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL, 
});

export default API;