import axios from 'axios';

export const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
export const GNEWS_API_KEY = import.meta.env.VITE_GNEWS_API_KEY;
export const NEWSDATA_API_KEY = import.meta.env.VITE_NEWSDATA_API_KEY;

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL, 
});

export default API;

// export const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
// export const GNEWS_API_KEY = import.meta.env.VITE_GNEWS_API_KEY;
// export const NEWSDATA_API_KEY = import.meta.env.VITE_NEWSDATA_API_KEY;