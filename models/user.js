const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    avatar: {
      type: String, //defining in the schema
    },
    faceid: {
      type: String, //defining in the schema
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamp: true, // to basically give info like created at ,updated at
  }
);
const User = mongoose.model("User", userSchema);
module.exports = User;
