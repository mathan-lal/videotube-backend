import mongoose, { Schema } from "mongoose";
import Jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true // If you want to make your field serachable in database in very efficient way, especially in mongoDB we use index
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },

    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true
    },

    avatar: {
        type: String, // we use cloudinary to getting image or avatar Url
        required: true
    },

    coverImage: {
        type: String
    },

    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Video'
        }
    ],

    password: {
        type: String,
        required: [true, 'Password is required']
    },

    refreshToken: {
        type: String
    }
}, {timestamps: true})

// ...........................
// but one problem have careted here, the probelm is that, when ever you want to update 
// any field which is userSchema, it will update your password as well, so this is the probelm
// we use if check here, with help of isModified method

// 1st logic
/*if(this.isModified('password')) {
    userSchema.pre('save', async function(next){
        this.password = bcrypt.hash(this.password, 10);
        next();
    });
}*/

// 2nd logic
userSchema.pre("save", async function(next) {
    if(!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// ...........................

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

// ...........................
// Now here we generate access token
userSchema.methods.generateAccessToken = function () {
    return Jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname
    },
    process.env.ACCESS_TOKEN_SECRET,
    {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
    )
}

userSchema.methods.generateRefreshToken = function () {
    return Jwt.sign({
        _id: this._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {expiresIn: REFRESH_TOKEN_EXPIRY}
    )
}

export const User = mongoose.model("User", userSchema);