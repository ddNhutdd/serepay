import axios from "axios";
import { getLocalStorage, setLocalStorage } from "./common";
import { localStorageVariable } from "src/constant";

export const DOMAIN = "https://remitano.dk-tech.vn/";
//export const DOMAIN = "https://serepay.net/";
export const BANK_API_DOMAIN = "https://api.vietqr.io/v2";
export const axiosService = axios.create({
  baseURL: DOMAIN,
  timeout: 180000,
});

const refreshToken = async () => {
  const refreshToken = getLocalStorage(localStorageVariable.user).refreshToken;
  let response = await axios.post(DOMAIN + "api/user/refreshToken", {
    refreshToken,
  });
  const newToken = response.data.data.token;
  const newExpiresIn = response.data.data.expiresIn;
  setLocalStorage(localStorageVariable.token, newToken);
  const user = getLocalStorage(localStorageVariable.user);
  user.token = newToken;
  user.expiresIn = newExpiresIn;
  setLocalStorage(localStorageVariable.user, user)
  return newToken;
};

axiosService.interceptors.request.use(
  async (config) => {
    if (getLocalStorage(localStorageVariable.user)) {
      if (Date.now() > getLocalStorage(localStorageVariable.user).expiresIn) {
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
      Authorization: "Bearer " + getLocalStorage(localStorageVariable.token),
    };
    return config;
  },
  (errors) => {
    return Promise.reject(errors);
  }
);

axiosService.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response.status === 401) {
      const username = getLocalStorage(localStorageVariable.user)?.username;
      setLocalStorage(localStorageVariable.expireToken, username);
    }
    return Promise.reject(error);
  }
);
