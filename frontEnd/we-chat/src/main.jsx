import React from "react";
import ReactDOM from "react-dom/client";
// import App from "./App.jsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./authenticate/ErrorPage.jsx";
import Register from "./authenticate/Register.jsx";
import Login from "./authenticate/Login.jsx";
import Chat from "./chats/Chat.jsx";
import FetchContacts from "./chats/FetchContacts.jsx";
import Connect from "./chats/Connect.jsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Register />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/login",
    element: <Login />,
    errorElement: <ErrorPage />,
  },
  {
    path: `/acceptInvite/:id`,
    element: <Connect />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/chat/fetchContacts",
    element: <FetchContacts />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "chatUi",
        element: (
          <FetchContacts>
            <Chat />
          </FetchContacts>
        ),
        errorElement: <ErrorPage />,
      },
    ],
  },
]);
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
