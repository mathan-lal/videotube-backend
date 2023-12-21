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
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw ApiError(
      500,
      "Something went worng while generating access or refresh tokens"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res

  const { fullName, email, username, password } = req.body;
  console.log(req.body);
  //console.log("fullName: , email: , username: , password: ", fullName, email, username, password);

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }
  //console.log(req.files);

  const avatarLocalPath = req.files?.avatar[0]?.path;
  console.log("this is avatar local path:", avatarLocalPath);
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  console.log(`after upload on cloudinary: `, avatar);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(
      400,
      "Avatar file is required Before Uploading to cloudinary"
    );
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username,
    //username: username ? username.toLowerCase() : undefined
  });

  console.log(user);

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // Design Algorithm
  // 1: Get the data from request body
  // 2: check user exists in database through -> username or email
  // 3: find the user
  // 4: check password is correct
  // 5: then we send accessToken or refreshToken in cookie
  // 6: send us response that's it

  try {
    const { username, email, password } = req.body;
    if (!(username || email)) {
      throw new ApiError(400, "email or password required");
    }
    const user = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (!user) {
      throw ApiError(404, "User not found");
    }

    const isPasswordValid = user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      throw ApiError(401, "invalid credentials");
    }

    // we make one function for generate refresh and access token, we can generate here
    // but these token use in many things that's why we do good practice, and make one
    // global function.
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: loggedInUser,
            accessToken,
            refreshToken,
          },
          "user successfully logged In"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Something went wrong when login");
  }
});

const logoutUser = asyncHandler(async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          refreshToken: undefined,
        },
      },
      {
        new: true,
      }
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User Logged Out"));
  } catch (error) {
    throw new ApiError(400, "error while logging out");
  }
});

const refreshAccessToken = asyncHandler(async(req, res, next) => {
  const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if(!incommingRefreshToken){
    throw new ApiError(401, "unAuthorized token");
  }
  const decodedToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  const user = await User.findById(decodedToken._id);
  if(!user){
    throw new ApiError(401, "invalid refreshToken")
  }

  if(incommingRefreshToken !== user?.refreshToken){
    throw new ApiError(401, "Refresh token is expired or used");
  }

  const options = {
    httpOnly: true,
    secure: true
  }

  const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);
  res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(new ApiResponse(
    200,
    {accessToken, refreshToken},
    "Access token refreshed"
  ))
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
