import { useEffect } from "react";
import { useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";

import { fetchNotify } from "./App";
import socket from "./util/socket";

const Config = (props) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const isLogin = useSelector((state) => state.loginReducer.isLogin);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (isLogin) {
      fetchNotify(dispatch);
    }
  }, [location]);

  return <>{props.children}</>;
};

export default Config;
