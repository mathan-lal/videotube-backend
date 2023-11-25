/*import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/apiResponse.js'; 

const registerUser = asyncHandler(async (req, res) => {
       // get user details from frontend or postman
       // validation fields should not leave empty or any validation as you need
       // check if user already exist
       // check for images, when check images espically check avatar
       // upload them on cloudinary, avatar
       // create user object -> then create user entry in DB
       // remove password and refresh token field from respone
       // check for user creation
       // return res

       const {fullname, email, username, password} = req.body;
       // console.log("email: ", email);

       if([fullname, email, username, password].some((field) =>{
        field?.trim() === ""
       })){
        throw new ApiError(400, "All fields are required");
       }

       const existedUser = await User.findOne({
        $or: [{username}, {email}]
       });

       if(existedUser) {
        throw new ApiError(409, "User with username and email already exists")
       }

       const avatarLocalPath = req.files?.avatar[0]?.path;
       console.log(avatarLocalPath);
       console.log(avatarLocalPath);
       //const coverImageLocalPath = req.files?.coverImage[0]?.path;

       let coverImageLocalPath;
       if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
           coverImageLocalPath = req.files.coverImage[0].path
       }

       if(!avatarLocalPath){
        throw new ApiError(400, "Avatar File is Requird");
       }

       const avatar = await uploadOnCloudinary(avatarLocalPath);
       //console.log(avatar);
       const coverImage = await uploadOnCloudinary(coverImageLocalPath);

       if(!avatar){
        throw new ApiError(400, "Avatar File is Required");
       }

       const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
       });

       const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
       );

       if(!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user");
       }

       return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
       )
});

export {registerUser};*/

import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const {fullName, email, username, password } = req.body;
    console.log(req.body);
    //console.log("fullName: , email: , username: , password: ", fullName, email, username, password);

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    //console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    console.log("this is avatar local path:",avatarLocalPath);
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    console.log(`after upload on cloudinary: `, avatar);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required Before Uploading to cloudinary")
    }
   

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username
        //username: username ? username.toLowerCase() : undefined
    });

    console.log(user);

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

} )


export {
    registerUser,
}