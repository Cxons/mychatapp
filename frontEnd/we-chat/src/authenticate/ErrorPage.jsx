/* eslint-disable no-unused-vars */
import React from "react";
import { useRouteError } from "react-router-dom";

function ErrorPage() {
  const error = useRouteError();
  console.log("the error", error);
  return (
    <div>
      <h1>Ooops!! an error occured</h1>
      <p>{error.statusText || error.message}</p>
    </div>
  );
}

export default ErrorPage;
