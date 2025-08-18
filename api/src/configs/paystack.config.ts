import axios from 'axios';
const PAYSTACK = axios.create({
    baseURL: 'https://api.flutterwave.com/v3',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor
PAYSTACK.interceptors.request.use(
    (config) => {
        config.headers.Authorization = `Bearer ${Bun.env.PAYSTACK_SECRET_KEY}`;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default PAYSTACK