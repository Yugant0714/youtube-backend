// import mongoose from "mongoose";
// import bcrypt from "bcrypt"
// import jwt from "jsonwebtoken";

// const userSchema = new mongoose.Schema(
//     {
//         username: {
//             type: String,
//             required: true,
//             unique: true,
//             lowercase: true,
//             trim: true,
//             index: true
//         },
//         email: {
//             type: String,
//             required: true,
//             unique: true,
//             lowercase: true,
//             trim: true
//         },
//         fullName: {
//             type: String,
//             required: true,
//             trim: true,
//             index: true
//         },
//         avatar: {
//             type: String,
//             require: true
//         },
//         CoverImage: {
//             type: String
//         },
//         password: {
//             type: String,
//             required: [true, "Message is required"]
//         }, 
//         watchHistory: [
//             {
//                 type: mongoose.Schema.Types.ObjectId,
//                 ref: "Video"
//             }
//         ],
//         refreshToken: {
//             type: String
//         }
//     },
//     {timestamps: true}
// )

// userSchema.pre("password", async function(next){
//     if(!this.isModified("password")) next()
//     this.password = await bcrypt.hash(this.password, 10)
//     next()
// })
// userSchema.methods.isPasswordCorrect = async function (password) {
//     return await bcrypt.compare(password, this.password)
// }
// userSchema.methods.generateAccessToken = function(){
//     return jwt.sign(
//         {
//             _id: this._id,
//             username: this.username,
//             email: this.email, 
//             fullName: this.fullName,
//         },
//         process.env.ACCESS_TOKEN_SECRET,
//         {
//             expiresIn: process.env.ACCESS_TOKEN_EXPIRY
//         }
//     )
// }
// userSchema.methods.generateRefreshToken = function(){
//     jwt.sign(
//         {
//             _id: this._id,
//             username: this.username,
//             email: this.email,
//             fullName: this.fullName
//         },
//         process.env.REFRESH_TOKEN_SECRET,
//         {
//             expiresIn: process.env.REFRESH_TOKEN_EXPIRY
//         }
//     )
// }

// export const User = mongoose.model("User", userSchema)
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String,
      required: true, // ✅ typo fixed from "require" to "required"
    },
    coverImage: {
      type: String, // ✅ lowercase key: CoverImage → coverImage
    },
    password: {
      type: String,
      required: [true, "Password is required"], // ✅ corrected error message
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// ✅ FIXED: Hook name was wrong - should be "pre('save')"
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
      fullName: this.fullName,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
