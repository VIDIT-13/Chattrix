import axios from "axios";

const BASE_URL= "https://chattrix-backend.onrender.com"

const axiosInstance= axios.create({
  baseURL: BASE_URL,
  
  withCredentials: true, // Include credentials (cookies) in requests
});
export default axiosInstance;