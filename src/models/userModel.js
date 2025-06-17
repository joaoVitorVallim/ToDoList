const mongoose = require('mongoose');
const { Schema } = mongoose;

const taskSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    schedule: {
        type: {
            type: String,
            enum: ['daily', 'weekly', 'biweekly', 'monthly', 'custom', 'specific'],
            required: true
        },
        days: [{
            type: Number,
            min: 0,
            max: 6
        }],
        dayOfMonth: {
            type: Number,
            min: 1,
            max: 31
        },
        interval: { type: Number },
        startDate: { type: Date },
        endDate: { type: Date },
        specificDate: { type: Date },
        time: { type: String },
        lastCompleted: { type: Date }
    }
});

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: false },
    googleId: { type: String, unique: true, sparse: true },
    tasks: [taskSchema],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);