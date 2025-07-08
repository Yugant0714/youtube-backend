// import asyncHandler from "../utils/asyncHandler.js"
// import ApiError from "../utils/apiError.js";
// import { User } from "../models/user.model.js"
// import {uploadOnCloudinary} from "../utils/cloudinary.js"
// import ApiResponse from "../utils/ApiResponse.js"
// import jwt from "jsonwebtoken"
// import mongoose from "mongoose"

// const generateAccesTokenAndRefreshToken = ( async (userId)=>{
//     try {
//         const user = await User.findById(userId)
//         const accessToken = user.generateAccessToken()
//         const refreshToken = user.generateRefreshToken()
//         user.refreshToken = refreshToken
//         await user.save({validateBeforeSave: false})
//         return {accessToken, refreshToken}
//     } catch (error) {
//         throw new ApiError(500, "Something wen wrong")
//     }
// })


// const userRegister = asyncHandler( async (req, res)=>{
//     // res.status(200).json({
//     //     message: "ok"
//     // })
//     const {username, email, password, fullName} = req.body
//     if(
//         [username, email, password, fullName].some((field)=> field?.trim() === "")
//     ){
//         throw new ApiError(400, "All fields are required!")
//     }
//     const existedUser = await User.findOne({
//         $or: [{username},{email}]
//     })
//     if(existedUser){
//         throw new ApiError(409, "User is already exists")
//     }
//     const avatarLocalPath = req.files?.avatar[0]?.path;
//     // const coverImageLocalPath = req.files?.coverImage[0]?.path;

//     let coverImageLocalPath;
//     if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
//         coverImageLocalPath = req.files.coverImage[0].path;
//     }

//     if(!avatarLocalPath){
//         throw new ApiError(400, "avatar is required")
//     }

//     const avatar = await uploadOnCloudinary(avatarLocalPath)
//     const coverImage = await uploadOnCloudinary(coverImageLocalPath)

//     if(!avatar){
//         throw new ApiError(400, "avatar is required") 
//     }

//     const user = await User.create({
//         fullName,
//         avatar: avatar.url,
//         coverImage: coverImage?.url,
//         email,
//         password,
//         username: username.toLowerCase()
//     })
//     const createdUser = await User.findById(user._id).select("-password -refreshToken")
//     if(!createdUser){
//         throw new ApiError(500, "Something went wrong")
//     }
//     return res.status(200).json(
//         new ApiResponse(200, createdUser, "User successfully registered")
//     )
// })

// const userLogin = asyncHandler( async(req, res)=>{
//     const {username, email, password} = req.body
    
//     if(!(username || email)){
//         throw new ApiError(400, "username or email is required")
//     }

//     const user = await User.findOne({
//         $or: [{username}, {email}]
//     })
//     if(!user){
//         throw new ApiError(404, "user does not exist")
//     }  
    
//     const isPasswordValid = await user.isPasswordCorrect(password)
//     if(!isPasswordValid){
//         throw new ApiError(401, "password is incorrect")
//     } 

//     const {accessToken, refreshToken} = await generateAccesTokenAndRefreshToken(user._id)

//     const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

//     const options = {
//         httpOnly: true,
//         secure: true
//     }

//     return res
//     .status(200)
//     .cookie("accessToken", accessToken, options)
//     .cookie("refreshToken", refreshToken, options)
//     .json(
//         new ApiResponse(
//             200,
//             {
//                 user: loggedInUser, accessToken, refreshToken
//             },
//             "user loggedin successfully"
//         )
//     )
// })

// const userLogout = asyncHandler( async(req, res)=>{
//     await User.findByIdAndUpdate(req.user._id,
//         {
//             $unset: {
//                 refreshToken: 1
//             }
//         },
//         {
//             new: true
//         }
//     )
//     const options = {
//         httpOnly: true,
//         secure: true
//     }

//     return res
//     .status(200)
//     .clearCookie("accessToken", options)
//     .clearCookie("refreshToken", options)
//     .json(
//         new ApiResponse(
//             200, 
//             {},
//             "successfully logout"
//         )
//     )

// })

// const refreshAccessToken = asyncHandler(async (req, res)=>{
//     const token = req.cookies?.refreshToken || req.body?.refreshToken
//     if(!token){
//         throw new ApiError(400, "unauthorized access")
//     }
//     const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
//     const user = await User.findById(decodedToken?._id)
//     if(!user){
//         throw new ApiError(401, "invalid refresh token")
//     }
//     if(token !== user.refreshToken){
//         throw new ApiError(401, "refreshtoken is expired or used")
//     }

//     const options = {
//         httpOnly: true,
//         secure: true
//     }

//     const {newAccessToken, newRefreshToken} = await generateAccesTokenAndRefreshToken(user._id)

//     return res
//     .status(200)
//     .cookie("accessToken", newAccessToken, options)
//     .cookie("refreshToken", newRefreshToken, options)
//     .json(
//         new ApiResponse(
//             200,
//             {
//                 accessToken: newAccessToken, 
//                 refreshToken: newRefreshToken
//             },
//             "access token refreshed"
//         )
//     )
// })

// const changeCurrentPassword = asyncHandler(async (req, res)=>{
    
//     const {oldPassword, newPassword} = req.body

//     const user = await User.findById(req.user?._id)
    
//     const isPasswordValid = await user.isPasswordCorrect(oldPassword)
//     if(!isPasswordValid){
//         throw new ApiError(400, "inavlid old password")
//     }
    
//     user.password = newPassword
//     await user.save({validateBeforeSave: false})

//     return res
//     .status(200)
//     .json(
//         new ApiResponse(
//             200,
//             {},
//             "password changed successfully"
//         )
//     )
// }) 

// const getCurrentUser = asyncHandler(async (req, res)=>{
//     return res
//     .status(200)
//     .json(
//         new ApiResponse(
//             200,
//             req.user,
//             "current user fetched successfully"
//         )
//     )
// })

// const updateAccountDetails = asyncHandler(async (req, res)=>{
//     const {fullName, email} = req.body
//     if(!fullName || !email){
//         throw new ApiError(400, "every field is required")
//     }

//     const user = await User.findByIdAndUpdate(
//         req.user._id,
//         {
//             $set: {
//                 fullName,
//                 email
//             }
//         },
//         {
//             new: true
//         }
//     ).select("-password")

//     return res
//     .status(200)
//     .json(
//         new ApiResponse(
//             200,
//             {},
//             "details updated successfully"

//         )
//     )
// })

// const updateAvatar = asyncHandler(async (req, res)=>{
//     const avatarLocalPath = req.file?.path
//     if(!avatarLocalPath){
//         throw new ApiError(400, "avatar file is missing")
//     }

//     const avatar = await uploadOnCloudinary(avatarLocalPath)
//     if(!avatar.url){
//         throw new ApiError(400, "Failed to upload on cloudinary")
//     }

//     const user = await User.findByIdAndUpdate(
//         req.user?._id,
//         {
//             $set: {
//                 avatar: avatar.url
//             }
//         },
//         {
//             new: true
//         }
//     ).select("-password")

//     return res
//     .status(200)
//     .json(
//         new ApiResponse(
//             200,
//             {user},
//             "successfully changes avatar"
//         )
//     )
// })

// const updateCoverImage = asyncHandler(async (req, res)=>{
//     const coverImagePath = req.file?.path
//     if(!coverImagePath){
//         throw new ApiError(400, "avatar file is missing")
//     }

//     const coverImage = await uploadOnCloudinary(coverImagePath)
//     if(!coverImage.url){
//         throw new ApiError(400, "Failed to upload on cloudinary")
//     }

//     const user = await User.findByIdAndUpdate(
//         req.user?._id,
//         {
//             $set: {
//                 coverImage: coverImage.url
//             }
//         },
//         {
//             new: true
//         }
//     ).select("-password")

//     return res
//     .status(200)
//     .json(
//         new ApiResponse(
//             200,
//             {user},
//             "successfully changes coverimage"
//         )
//     )
// })

// const getUserChannelProfile = asyncHandler(async (req, res)=>{
//     const {username} = req.params
//     if(!username){
//         throw new ApiError(400, "usename is missing")
//     }

//     const channnel = await User.aggregate([
//         {
//             $match: {
//                 username: username?.toLowerCase()
//             }
//         },
//         {
//             $lookup: {
//                 from: "subscriptions",
//                 localField: "_id",
//                 foreignField: "channel",
//                 as: "subscribers"
//             }
//         },
//         {
//             $lookup: {
//                 from: "subscriptions",
//                 localField: "_id",
//                 foreignField: "subscriber",
//                 as: "subscribedTo"
//             }
//         },
//         {
//             $addFields: {
//                 countSubscribers : {
//                     $size: "$subscribers"
//                 },
//                 countSubscribedTo: {
//                     $size: "$subscribedTo"
//                 },
//                 isSubscribed: {
//                     $cond: {
//                         if: {$in: [req.user?._id, "$subscribers.subscriber"]},
//                         then: true,
//                         else: false
//                     }
//                 }
//             }
//         },
//         {
//             $project: {
//                 username: 1,
//                 fullName: 1,
//                 email: 1,
//                 countSubscribers: 1,
//                 countSubscribedTo: 1,
//                 avatar: 1,
//                 coverImage: 1
//             }
//         }
//     ])

//     if(!channnel?.length){
//         throw new ApiError(400, "channel does not exist")
//     }

//     return res
//     .status(200)
//     .json(
//         new ApiResponse(200, channnel[0], "user channel fatched successfully")
//     )
// })

// const getWatchHistory = asyncHandler(async (req, res)=>{
//     const user = await User.aggregate([
//         {
//             $match: {
//                 _id: new mongoose.Types.ObjectId (req.user?._id)
//             }
//         },
//         {
//             $lookup: {
//                 from: "videos",
//                 localField: "watchHistory",
//                 foreignField: "_id",
//                 as: "watchHistory",
//                 pipeline: [
//                     {
//                         $lookup: {
//                             from: "users",
//                             localField: "owner",
//                             foreignField: "_id",
//                             as: "owner",
//                             pipeline: [
//                                 {
//                                     $project: {
//                                         fullName: 1,
//                                         username: 1,
//                                         avatar: 1
//                                     }
//                                 }
//                             ]
//                         }
//                     },
//                     {
//                         $addFields: {
//                             owner: {
//                                 $first: "$owner"
//                             }
//                         }
//                     }
//                 ],
//             }
//         }
//     ])
//     if (!user || user.length === 0) {
//         return res.status(404).json({ message: "User not found or no watch history." });
//     }

//     return res
//     .status(200)
//     .json(
//         new ApiResponse(
//             200,
//             user[0].watchHistory,
//             "watch history fetched successfully"
//         )
//     )
// })

// export {
//     userRegister,
//     userLogin,
//     userLogout,
//     refreshAccessToken,
//     changeCurrentPassword,
//     getCurrentUser,
//     updateAccountDetails,
//     updateAvatar,
//     updateCoverImage,
//     getUserChannelProfile,
//     getWatchHistory
// }
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong");
    }
};

const userRegister = asyncHandler(async (req, res) => {
    const { username, email, password, fullName } = req.body;

    if ([username, email, password, fullName].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required!");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, "User already exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avatar?.url) {
        throw new ApiError(400, "Failed to upload avatar to Cloudinary");
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url,
        email,
        password,
        username: username.toLowerCase()
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User successfully registered")
    );
});

const userLogin = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!(username || email)) {
        throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Password is incorrect");
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully"));
});

const userLogout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $unset: { refreshToken: 1 }
    });

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "Successfully logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) {
        throw new ApiError(400, "Unauthorized access");
    }

    const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id);

    if (!user) {
        throw new ApiError(401, "Invalid refresh token");
    }

    if (token !== user.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
        httpOnly: true,
        secure: true
    };

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await generateAccessTokenAndRefreshToken(user._id);

    return res
        .status(200)
        .cookie("accessToken", newAccessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new ApiResponse(200, { accessToken: newAccessToken, refreshToken: newRefreshToken }, "Access token refreshed"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);

    const isPasswordValid = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid old password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
        throw new ApiError(400, "Every field is required");
    }

    await User.findByIdAndUpdate(req.user._id, {
        $set: { fullName, email }
    });

    return res.status(200).json(new ApiResponse(200, {}, "Details updated successfully"));
});

const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar.url) {
        throw new ApiError(400, "Failed to upload on Cloudinary");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { avatar: avatar.url } },
        { new: true }
    ).select("-password");

    return res.status(200).json(new ApiResponse(200, { user }, "Successfully changed avatar"));
});

const updateCoverImage = asyncHandler(async (req, res) => {
    const coverImagePath = req.file?.path;
    if (!coverImagePath) {
        throw new ApiError(400, "Cover image file is missing");
    }

    const coverImage = await uploadOnCloudinary(coverImagePath);
    if (!coverImage.url) {
        throw new ApiError(400, "Failed to upload on Cloudinary");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: { coverImage: coverImage.url } },
        { new: true }
    ).select("-password");

    return res.status(200).json(new ApiResponse(200, { user }, "Successfully changed cover image"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;
    if (!username) {
        throw new ApiError(400, "Username is missing");
    }

    const channel = await User.aggregate([
        { $match: { username: username.toLowerCase() } },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                countSubscribers: { $size: "$subscribers" },
                countSubscribedTo: { $size: "$subscribedTo" },
                isSubscribed: {
                    $in: [req.user?._id, "$subscribers.subscriber"]
                }
            }
        },
        {
            $project: {
                username: 1,
                fullName: 1,
                email: 1,
                countSubscribers: 1,
                countSubscribedTo: 1,
                avatar: 1,
                coverImage: 1
            }
        }
    ]);

    if (!channel.length) {
        throw new ApiError(404, "Channel does not exist");
    }

    return res.status(200).json(new ApiResponse(200, channel[0], "User channel fetched successfully"));
});

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(req.user?._id) }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                { $project: { fullName: 1, username: 1, avatar: 1 } }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: { $first: "$owner" }
                        }
                    }
                ]
            }
        }
    ]);

    if (!user?.length) {
        return res.status(404).json(new ApiResponse(404, [], "User not found or no watch history"));
    }

    return res.status(200).json(new ApiResponse(200, user[0].watchHistory, "Watch history fetched successfully"));
});

export {
    userRegister,
    userLogin,
    userLogout,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage,
    getUserChannelProfile,
    getWatchHistory
};
