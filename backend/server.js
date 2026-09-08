const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const Message = require("./models/Message");
const safeZoneRoutes = require('./routes/safeZoneRoutes');
const helmet =
require("helmet");
const mongoSanitize =
require("express-mongo-sanitize");

// const xss =
// require("xss-clean");


dotenv.config();
const connectDB = require("./config/db");
connectDB();

if (!process.env.JWT_SECRET) {
    throw new Error(
        "JWT_SECRET missing"
    );
}
const app = express();

// 1. Middleware Order Sahi Karo (JSON pehle aana chahiye)
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true
}));
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// server.js mein check kar ye dono line honi chahiye:
// Other Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/items", require("./routes/itemRoutes"));


app.use(helmet());

// 1. User side wala (Jo tune abhi banaya)
app.use("/api/support", require("./routes/supportRoutes")); 

// 2. Admin side wala (Jahan se admin reports dekhega)
app.use("/api/admin", require("./routes/adminRoutes"));
// 2. Routes
app.use('/api/safe-zones', safeZoneRoutes);
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/uploads", express.static("uploads"));

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "active",
    message: "Server is running smoothly",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => res.send("Foundit Systems Online 🚀"));

const server = http.createServer(app);
const io = new Server(server, { 
    cors: { 
        origin: ["http://localhost:5173", "http://localhost:3000"], 
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling'] 
});
app.set('socketio', io);

const onlineUsers = new Map();

io.on("connection", (socket) => {
    

    socket.on("join_support_ticket", (ticketId) => {
        socket.join(`ticket_${ticketId}`);
        console.log(`📡 Signal: Joined Room ticket_${ticketId}`);
    });

    // Support Message Handler
    socket.on("send_support_message", (data) => {
        // data: { ticketId, text, sender }
        io.to(`ticket_${data.ticketId}`).emit("receive_support_message", data);
    });

    socket.on("user_online", (userId) => {
        if (!userId) return;
        onlineUsers.set(String(userId), socket.id);
        // Socket object mein hi userId save kar lo taaki disconnect pe loop na chalana pade
        socket.userId = String(userId); 
        io.emit("status_update", { userId: String(userId), status: "online" });
    });

    socket.on("join_chat", async (roomId) => {
        try {
            socket.join(String(roomId));
            const history = await Message.find({ roomId: String(roomId) }).sort({ createdAt: 1 });
            socket.emit("load_messages", history);
        } catch (err) {
            console.error("Join Chat Error:", err);
        }
    });

    socket.on("get_user_status", (targetUserId) => {
        const isOnline = onlineUsers.has(String(targetUserId));
        socket.emit("status_update", { 
            userId: String(targetUserId), 
            status: isOnline ? "online" : "offline" 
        });
    });

// 🔥 ADD THIS FUNCTION TOP PAR (io.on ke upar ya file ke top me)
const generateRoomId = (user1, user2, itemId) => {
  return [String(user1), String(user2)]
    .sort()
    .join("_") + "_" + String(itemId);
};


// 🔥 REPLACE send_message
socket.on("send_message", async (data) => {
    try {
        const roomId = generateRoomId(
            data.senderId,
            data.receiverId,
            data.itemId
        );

        const newMessage = new Message({
            ...data,
            roomId,
            senderId: new mongoose.Types.ObjectId(data.senderId),
            receiverId: new mongoose.Types.ObjectId(data.receiverId)
        });

        const savedMsg = await newMessage.save();

        io.to(roomId).emit("receive_message", savedMsg);

    } catch (err) {
        console.error("Send Message Error:", err);
    }
});
    socket.on("join_support_ticket", (ticketId) => {
    socket.join(`ticket_${ticketId}`);
    console.log(`📡 Support Signal: Joined Ticket Room ${ticketId}`);
});

// Real-time Support Message (With SaaS metadata)
socket.on("send_support_message", (data) => {
    // data: { ticketId, text, sender, image, isInternal }
    io.to(`ticket_${data.ticketId}`).emit("receive_support_message", data);
    
    // SaaS Feature: Agar admin bhej raha hai toh user ko global notification bhejo
    if(data.sender === "admin") {
        const targetSocket = onlineUsers.get(String(data.userId));
        if(targetSocket) {
            io.to(targetSocket).emit("new_support_alert", { 
                ticketId: data.ticketId, 
                text: "Admin has responded to your case." 
            });
        }
    }
});

// SaaS Feature 3: Typing Indicator
socket.on("support_typing", (data) => {
    socket.to(`ticket_${data.ticketId}`).emit("support_typing_status", { 
        isTyping: data.isTyping, 
        sender: data.sender 
    });
});

    // Calling Signals
    socket.on("initiate_call", (data) => socket.to(String(data.roomId)).emit("incoming_call", data));
    socket.on("accept_call", (data) => socket.to(String(data.roomId)).emit("call_accepted"));
    socket.on("end_call", (data) => socket.to(String(data.roomId)).emit("call_ended"));

    socket.on("disconnect", () => {
        if (socket.userId) {
            onlineUsers.delete(socket.userId);
            io.emit("status_update", { userId: socket.userId, status: "offline" });
        }
    });
});



app.get("/", (req, res) => res.send("Foundit Systems Online 🚀"));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 PROTOCOL ACTIVE ON PORT ${PORT}`);
});