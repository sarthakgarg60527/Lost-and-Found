import io from "socket.io-client";

// Ek baar connection define karo
const socket = io("http://localhost:5000", {
    transports: ["websocket"],
    withCredentials: true
});

export { socket }; // Yahan se export ho raha hai