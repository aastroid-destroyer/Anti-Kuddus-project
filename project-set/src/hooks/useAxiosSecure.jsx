import axios from 'axios';
import { auth } from '../firebase/firebase.config';

const axiosSecure = axios.create({
    baseURL: 'http://localhost:3000'
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
