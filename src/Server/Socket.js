import { Server } from "socket.io";

export default function Socket(server) {
    const io = new Server(server);

    io.on("connection", (socket) => {
        console.log("a user connected");
    });

    return io;
}