import { io } from "socket.io-client";

export const socket = io(
  "https://mychatapp-frontend-b9dkdslc0-chuxons-projects.vercel.app/"
);
