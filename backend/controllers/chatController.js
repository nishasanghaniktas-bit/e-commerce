const Chat = require("../models/Chat");

exports.getChats = async (req, res) => {
  try {
    const chats = req.user.role === "admin" 
      ? await Chat.find().populate("user", "name email")
      : await Chat.find({ user: req.user.id });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id).populate("user", "name email");
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    let chat = await Chat.findOne({ user: req.user.id, status: "open" });
    if (!chat) chat = await Chat.create({ user: req.user.id, messages: [] });
    chat.messages.push({ sender: "user", message: req.body.message });
    await chat.save();
    res.json(chat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.replyMessage = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    chat.messages.push({ sender: "admin", message: req.body.message });
    await chat.save();
    res.json(chat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.closeChat = async (req, res) => {
  try {
    await Chat.findByIdAndUpdate(req.params.id, { status: "closed" });
    res.json({ message: "Chat closed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
