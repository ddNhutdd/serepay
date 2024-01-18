import { useEffect } from "react";
import { useLocation } from "react-router";
import { useDispatch } from "react-redux";
import { fetchNotify } from "./App";

const ScrollToTop = (props) => {
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    fetchNotify(dispatch);
    window.scrollTo(0, 0);
  }, [location]);
  useEffect(() => {
    fetchNotify(dispatch);
  }, []);

  return <>{props.children}</>;
};

export default ScrollToTop;
