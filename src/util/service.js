import axios from "axios";
export const DOMAIN = "https://remitano.dk-tech.vn/";
export const axiosService = axios.create({
  baseURL: DOMAIN,
  timeout: 180000,
});
const refreshToken = async () => {
  const refreshToken = JSON.parse(localStorage.getItem("user")).refreshToken;
  let response = await axios.post(DOMAIN + "api/user/refreshToken", {
    refreshToken,
  });
  const newToken = response.data.data.token;
  const newExpiresIn = response.data.data.expiresIn;
  localStorage.setItem("token", newToken);
  const user = JSON.parse(localStorage.getItem("user"));
  user.token = newToken;
  user.expiresIn = newExpiresIn;
  localStorage.setItem("user", JSON.stringify(user));
  return newToken;
};
axiosService.interceptors.request.use(
  async (config) => {
    if (localStorage.getItem("user")) {
      if (Date.now() > JSON.parse(localStorage.getItem("user")).expiresIn) {
        const newToken = await refreshToken();
        config.headers = {
          ...config.headers,
          Authorization: "Bearer " + newToken,
        };
        return config;
      }
    }
    config.headers = {
      ...config.headers,
      Authorization: "Bearer " + localStorage.getItem("token"),
    };
    return config;
  },
  (errors) => {
    console.log("axios services");
    return Promise.reject(errors);
  }
);
