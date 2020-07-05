import React from "react";
import { Route, BrowserRouter } from "react-router-dom";

import Home from "./pages/Home";
import CreatePoint from "./pages/CreatePoint";

const Routes = () => {
  return (
    <BrowserRouter>
      <Route componente={Home} path="/" exact />
      <Route componente={CreatePoint} path="/create-point" />
    </BrowserRouter>
  );
};

export default Routes;
