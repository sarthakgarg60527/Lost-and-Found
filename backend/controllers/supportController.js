const Support = require("../models/Support");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const mongoose = require("mongoose");

// 1. User: Nayi Request bhejega
exports.createReport = async (req, res) => {
    try {
        const { subject, message } = req.body;
        const report = new Support({ 
            user: req.user.id, 
            subject, 
            message,
            status: "pending" 
        });
        await report.save();
        res.status(201).json({ message: "Request submitted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Reporting failed" });
    }
};

// 2. User: Apni history dekhega
exports.getMyReports = async (req, res) => {
    try {
        const reports = await Support.find({ user: req.user.id }).sort("-createdAt");
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch history" });
    }
};

// 3. Admin: Saari PENDING reports dekhega
// supportController.js
exports.getAllReports = async (req, res) => {
    try {
        const { status, priority, search } = req.query;
        let query = {};

        if (status && status !== 'all') query.status = status;
        if (priority) query.priority = priority;
        
        if (search) {
            query.$or = [
                { ticketId: { $regex: search, $options: "i" } },
                { subject: { $regex: search, $options: "i" } }
            ];
        }

        // 🔥 FIX: karma ko badal kar karmaPoints karo
        const reports = await Support.find(query)
            .populate("user", "name email profileImage karmaPoints createdAt postsCount") 
            .sort("-updatedAt"); 
            
        res.json(reports);
    } catch (err) {
        res.status(500).json({ message: "Admin search failed" });
    }
};

// 4. Admin: Resolve karega WITH REPLY
// controllers/supportController.js
exports.resolveReport = async (req, res) => {
    try {
        const { adminReply } = req.body;
        
        const report = await Support.findByIdAndUpdate(
            req.params.id, 
            { 
                status: "resolved", 
                adminReply: adminReply 
            }, 
            { new: true }
        ).populate("user", "name email");

        if (!report) return res.status(404).json({ message: "Ticket not found" });

        // 🔥 FIX: Socket emit karna zaroori hai taaki user ko turant dikhe
        const io = req.app.get('socketio');
        if (io) {
            const socketData = {
                ticketId: report._id,
                text: adminReply,
                sender: "admin",
                status: "resolved",
                createdAt: new Date()
            };
            // User ke private room ya ticket room dono mein bhej do
            io.to(`ticket_${report._id}`).emit("receive_support_message", socketData);
        }
        
        res.json({ message: "Reply sent and ticket resolved!", report });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// 1. User: Pehla Message bhejega (Ticket Open Karega)
exports.createTicket = async (req, res) => {
    try {
        const { subject, message, priority, category, attachments } = req.body;
        const ticketId = `#FIT-${Math.floor(1000 + Math.random() * 9000)}`;
        const ticket = new Support({
            user: req.user.id,
            ticketId,
            subject,
            priority: priority || "Medium",
            category: category || "General Inquiry",
            status: "open",
            messages: [{ sender: "user", text: message, attachments: attachments || [] }]
        });
        await ticket.save();

        // Real-time notification to Admin (Global Room)
        const io = req.app.get('socketio');
        if (io) io.emit("new_ticket_alert", ticket);

        res.status(201).json(ticket);
    } catch (err) {
        res.status(500).json({ message: "SaaS creation failed" });
    }
};
// 2. 🔥 Admin/User: Message Add + Agent linking (Yeh 404 fix karega)
exports.addMessage = async (req, res) => {
    try {
        const { text, sender, isInternal } = req.body;
        const ticket = await Support.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: "Ticket not found" });

      const newMessage = { 
    _id: new mongoose.Types.ObjectId(), // ✅ ADD THIS
    sender, 
    text, 
    isInternal: isInternal || false, 
    createdAt: new Date() 
};

        const updatedTicket = await Support.findByIdAndUpdate(
            req.params.id,
            { $push: { messages: newMessage } },
            { new: true }
        );
      

        // 🔥 SOCKET SYNC: Har message par emit hona chaiye
        const io = req.app.get('socketio');
        if (io) {
            const socketData = {
                ticketId: updatedTicket._id,
                ...newMessage,
                status: updatedTicket.status
            };
            // Ticket room mein broadcasting
            io.to(`ticket_${updatedTicket._id}`).emit("receive_support_message", socketData);
        }

        res.json(updatedTicket);
    } catch (err) {
        res.status(500).json({ message: "Transmission failed" });
    }
};
// 3. Admin: Live Chat Join Karega
exports.joinChat = async (req, res) => {
    try {
        const ticket = await Support.findByIdAndUpdate(
            req.params.id,
            { status: "active" },
            { new: true }
        ).populate("user", "name email profileImage karma createdAt postsCount"); // 🔥 Populate yahan bhi zaroori hai

        if (!ticket) return res.status(404).json({ message: "Ticket not found" });

        const io = req.app.get('socketio');
        if (io) {
            io.to(`ticket_${ticket._id}`).emit("receive_support_message", {
                ticketId: ticket._id,
                text: "SYSTEM: HQ Admin has joined the secure channel.",
                sender: "admin",
                status: "active",
                createdAt: new Date()
            });
        }
        res.json(ticket);
    } catch (err) {
        res.status(500).json({ message: "Connection failed" });
    }
};
exports.requestAgent = async (req, res) => {
    try {
        const ticket = await Support.findByIdAndUpdate(
            req.params.id,
            { status: "requesting" }, 
            { new: true }
        ).populate("user", "name email");

        if (!ticket) return res.status(404).json({ message: "Ticket not found" });

        const io = req.app.get('socketio');
        if (io) {
            io.emit("admin_agent_request", {
                ticketId: ticket._id,
                user: ticket.user.name, // ✅ Use ticket.user.name instead of req.user.name
                subject: ticket.subject,
                status: "requesting"
            });
        }
        res.json({ message: "Signal sent to HQ.", status: "requesting" });
    } catch (err) {
        res.status(500).json({ message: "Signal failed" });
    }
};