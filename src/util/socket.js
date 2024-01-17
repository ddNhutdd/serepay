import io from "socket.io-client";
import { DOMAIN } from "./service";

var socket = io(DOMAIN, {
  transports: ["websocket", "polling", "flashsocket"],
});

socket.on("connect", () => {
  console.log("socketIO: Connected to server");
});

socket.on("disconnect", () => {
  console.log("socketIO: Disconnected from server");
});

export default socket;
