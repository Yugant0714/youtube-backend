import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, refreshAccessToken, updateAccountDetails, updateAvatar, updateCoverImage, userLogin, userLogout, userRegister } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    userRegister
)
router.route("/login").post(userLogin)
router.route("/logout").post(verifyJWT, userLogout)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current-user").post(verifyJWT, getCurrentUser)
router.route("/upadte-account").patch(updateAccountDetails)
router.route("/avatar").post(verifyJWT, upload.single("avatar"), updateAvatar)
router.route("/cover-image").post(verifyJWT, upload.single("coverImage"), updateCoverImage)
router.route("/c/:username").post(verifyJWT, getUserChannelProfile)
router.route("/watch-history").post(verifyJWT, getWatchHistory)

export default router