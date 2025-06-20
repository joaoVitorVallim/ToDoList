const mongoose = require('mongoose');
const { Schema } = mongoose;

const taskSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    list_dates: [{ type: Date, required: true }],
    completed: [{ type: Date, default: [] }],
    time: { type: String, required: true }, // Format: HH:mm
    notified: [{ type: Date, default: [] }],
    createdAt: { type: Date, default: Date.now }
});

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: false },
    googleId: { type: String, unique: true, sparse: true },
    tasks: [taskSchema],
    createdAt: { type: Date, default: Date.now },
    resetCode: { type: String, default: null },
    resetCodeExpires: { type: Date, default: null }
});

module.exports = mongoose.model('User', userSchema);