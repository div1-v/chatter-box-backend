const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");
const User = require("../models/user");
const Group = require("../models/group");
const Chat = require("../models/chat");
const getConversation = require("../helpers/getConversation");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});

const onlineUsers = new Set();
io.on("connection", async (socket) => {
  const token = socket.handshake.auth.token;

  const user = await getUserDetailsFromToken(token);

  socket.join(user?._id?.toString());
  onlineUsers.add(user?._id?.toString());

  io.emit("onlineUser", Array.from(onlineUsers));
  socket.on("message-page", async (userId) => {
    const userDetails = await User.findById(userId).select("-password");

    const payload = {
      _id: userDetails?._id,
      name: userDetails?.name,
      email: userDetails?.email,
      online: onlineUsers.has(userId),
      profile_pic: userDetails?.profile_pic,
    };
    socket.emit("message-user", payload);
    //previos message
    const getAllMessages = await Group.findOne({
      $or: [
        { sender: user?._id, receiver: userId },
        { sender: userId, receiver: user?._id },
      ],
    })
      .populate("messages")
      .sort({ updatedAt: -1 });
    if (getAllMessages) {
      socket.emit("message", getAllMessages?.messages);
    }
  });

  //new message
  socket.on("new-message", async (data) => {
    let group = await Group.findOne({
      $or: [
        { sender: data.sender, receiver: data?.receiver },
        { sender: data.receiver, receiver: data?.sender },
      ],
    });
    if (!group) {
      const p = await Group.create({
        sender: data.sender,
        receiver: data?.receiver,
      });
      group = p;
    }

    const message = await Chat.create({
      text: data?.text,
      imageUrl: data?.imageUrl,
      videoUrl: data?.videoUrl,
      msgByUserId: data.msgByUserId,
    });
    const updatedGroup = await Group.updateOne(
      { _id: group._id },
      {
        $push: {
          messages: message._id,
        },
      }
    );
    const getAllMessages = await Group.findOne({
      $or: [
        { sender: data.sender, receiver: data?.receiver },
        { sender: data.receiver, receiver: data?.sender },
      ],
    })
      .populate("messages")
      .sort({ updatedAt: -1 });

    io.to(data?.sender.toString()).emit("message", getAllMessages.messages);
    io.to(data?.receiver.toString()).emit("message", getAllMessages.messages);

    const convoSender = await getConversation(data?.sender);
    const convoReceiver = await getConversation(data?.receiver);

    io.to(data?.sender.toString()).emit("conversation", convoSender);
    io.to(data?.receiver.toString()).emit("conversation", convoReceiver);
  });

  socket.on("seen", async (msgByUserId) => {
    let conversation = await Group.findOne({
      $or: [
        { sender: user?._id, receiver: msgByUserId },
        { sender: msgByUserId, receiver: user?._id },
      ],
    });

    const conversationMessageId = conversation?.messages || [];

    const updateMessages = await Chat.updateMany(
      { _id: { $in: conversationMessageId }, msgByUserId: msgByUserId },
      { $set: { seen: true } }
    );

    //send conversation
    const conversationSender = await getConversation(user?._id?.toString());
    const conversationReceiver = await getConversation(msgByUserId);

    io.to(user?._id?.toString()).emit("conversation", conversationSender);
    io.to(msgByUserId).emit("conversation", conversationReceiver);
  });

  //sidebar
  socket.on("sidebar", async (currentUserId) => {
    const convo = await getConversation(currentUserId);
    socket.emit("conversation", convo);
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(user?._id);
  });
});

module.exports = {
  app,
  server,
};
