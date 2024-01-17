import { getLocalStorage } from "src/util/common";

const defaultState = {
  isLogin:
    localStorage.getItem("token") && localStorage.getItem("user")
      ? true
      : false,
  username: getLocalStorage("user")?.username,
};

export const loginReducer = (state = defaultState, action) => {
  switch (action.type) {
    case "USER_LOGIN": {
      return {
        ...state,
        isLogin: true,
        username: getLocalStorage("user")?.username,
      };
    }
    case "USER_LOGOUT": {
      return {
        ...state,
        isLogin: false,
      };
    }
    default:
      return state;
  }
};
