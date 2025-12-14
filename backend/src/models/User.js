import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
    },
    age: {
        type: Number,
        required: [true, 'Please add an age'],
    },
    location: {
        type: String,
        required: [true, 'Please add a location'],
    },
}, {
    timestamps: true,
});

export default mongoose.model('User', userSchema);
