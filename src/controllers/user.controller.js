import {asyncHandler} from '../utils/asyncHandler.js';
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
       console.log("email: ", email);

       if([fullname, email, username, password].some((field) =>{
        field?.trim() === ""
       })){
        throw new ApiError(400, "All fields are required");
       }

       const existedUser = User.findOne({
        $or: [{username}, {email}]
       });

       if(existedUser) {
        throw new ApiError(409, "User with username and email already exists")
       }

       const avatarLocalPath = req.files?.avatar[0]?.path;
       const coverLocalPath = req.files?.avatar[0]?.path;

       if(!avatarLocalPath){
        throw new ApiError(400, "Avatar File is Requird");
       }

       const avatar = await uploadOnCloudinary(avatarLocalPath);
       const coverImage = await uploadOnCloudinary(coverLocalPath);

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

export {registerUser};