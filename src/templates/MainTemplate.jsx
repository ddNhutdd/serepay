import React from "react";
import { Route } from "react-router-dom";
import Footer from "src/components/Footer";
import Header2 from "src/components/header";
import ReLogin from "src/components/reLogin";
export default function MainTemplate(props) {
  return (
    <>
      <Route
        exact
        path={props.path}
        render={(propsRoute) => {
          return (
            <div className="main-template">
              <div className="main-template__bg-1"></div>
              <div className="main-template__bg-2"></div>
              <div className="main-template__bg-3"></div>
              <Header2 {...propsRoute} />
              <div style={{ minHeight: "100vh" }}>
                <props.component {...propsRoute} />
              </div>
              <Footer {...propsRoute} />
            </div>
          );
        }}
      />
      <ReLogin />
    </>
  );
}
