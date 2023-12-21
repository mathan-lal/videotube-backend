import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js"

const verifyJwt = asyncHandler(async (req, _, next) => {
 try {
     const token =
       req.cookies?.accessToken ||
       req.header("Authorization")?.replace("Bearer ", "");
   
       if(!token){
           throw new ApiError(401, "Unauthorized Request");
       }
   
       const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
       // if token decoded successfully then we find user
       const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
       // if user not found through the above step, it's toekn is invalid
       if(!user){
           throw new ApiError(401, "Invalid access Token");
       }
   
       req.user = user;
       next();
 } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access Toekn");
 }
});

export {verifyJwt};