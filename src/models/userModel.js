const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    tasks: {
        type: [{
            title: { type: String, required: true },
            description: { type: String, required: true },
            completed: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now }
        }], default: []
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);