require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const hpp = require("hpp");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const connectDB = require("./config/connect");
const Room = require("./models/Room");

// --- ROUTES ---
const messageRoutes = require("./routes/message.routes");
const userRoutes = require("./routes/user.routes");
const ticketRoutes = require("./routes/ticket.routes");
const notificationRoutes = require("./routes/notification.routes");
const webhookRoutes = require("./routes/webhook.route");
const chatmessageRoutes = require("./routes/chatmessage.routes");
const emailRoutes = require("./routes/new.ticket.routes");
const customerRoutes = require("./routes/customer.routes");
const snapshotRoutes = require("./routes/snapshot.routes");
const newChatRoutes = require("./routes/new.chat.routes");
const roomRoutes = require("./routes/room.routes");
const User = require("./models/User");
const initCallSocket = require("./sockets/callSocket");

// --- INIT APP ---
const app = express();
const server = http.createServer(app);

// ✅ Allowed Origins
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5500",
  "https://chatbot-qqsq.onrender.com",
  "https://livechat-1xfh.onrender.com",
];

// ✅ Common CORS check
const checkOrigin = (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin)) callback(null, true);
  else callback(new Error("Not allowed by CORS"));
};

// ✅ Middlewares
app.use(helmet());
app.use(hpp());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: checkOrigin,
    credentials: true,
  })
);

// ✅ Static File Serving (Uploads)
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  },
  express.static(path.join(__dirname, "uploads"))
);

// ✅ DB Connect
connectDB();

// Maps
const connectedUsers = new Map();

// Socket.io
const io = new Server(server, {
  cors: { origin: checkOrigin, methods: ["GET", "POST"], credentials: true },
});

// 🔐 Socket Auth (JWT)
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next();
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    socket.userId = payload?.id?.toString();
    if (!socket.userId) return next();

    // Optional: attach some user props
    const user = await User.findById(socket.userId).select("-password");
    socket.user_name = user?.user_name;
    socket.name = user?.name;
    next();
  } catch (err) {
    console.error("Socket auth error:", err.message);
    next();
  }
});

// 🧩 Attach the call socket layer
initCallSocket(io, connectedUsers);

// ✅ API Routes
app.use("/api/v1/chat", messageRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/tickets", ticketRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/webhook", webhookRoutes);
app.use("/api/v1/email", emailRoutes);
app.use("/api/v1/chatmessage", chatmessageRoutes);
app.use("/api/v1/customer", customerRoutes);
app.use("/api/v1/snapshot", snapshotRoutes);
app.use("/api/v1/newchat", newChatRoutes);
app.use("/api/v1/room", roomRoutes);

// ✅ Health Check
app.get("/", (req, res) => {
  res.json({ message: "✅ Secure Express API is running" });
});

app.set("trust proxy", true);

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server listening at http://localhost:${PORT}`)
);
