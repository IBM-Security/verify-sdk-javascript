import React, { Component } from 'react';
import {BrowserRouter, Redirect, Route, Switch} from 'react-router-dom';


const PrivateRoute = ({component: Component, ...rest}) => (
  <Route {...rest} render={(props) => (
      isAuthenticated === true
      ? <Component {...props} />
      : <Redirect to='/' />
  )} />
);



const Router = () => {
  return (
    <div>
      
    </div>
  );
};

export default Router;
