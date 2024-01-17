import React from "react";
import { Route } from "react-router-dom";
import Header from "src/components/admin/header";
import Sidebar from "src/components/admin/sidebar";
export default function AdminTemplate(props) {
  return (
    <Route
      exact
      path={props.path}
      render={(propsRoute) => {
        return (
          <div className="adminTemplate">
            <Header {...propsRoute} />
            <div className="adminTemplate__content">
              <Sidebar />
              <div className="adminTemplate__content-main">
                <props.component {...propsRoute} />
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}
