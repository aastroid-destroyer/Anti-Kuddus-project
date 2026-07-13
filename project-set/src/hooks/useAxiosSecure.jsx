import axios from 'axios';
import { auth } from '../firebase/firebase.config';

// In dev this falls back to the local server; in prod set VITE_API_URL to
// the deployed backend's URL (e.g. https://your-server.onrender.com).
const axiosSecure = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000'
})

// Registered ONCE at module load (not per render) so requests never pick up
// duplicate interceptors. Before every request, if a Firebase user is signed
// in, attach a fresh ID token as a Bearer header. Missions 1-4 routes ignore
// this header; the Mission 5 SOS routes require it (backend verifyToken).
axiosSecure.interceptors.request.use(async (config) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
        const token = await currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const useAxiosSecure = () => {

    return axiosSecure;
};

export default useAxiosSecure;
