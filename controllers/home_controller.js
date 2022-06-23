const Post = require("../models/post");

const User = require("../models/user");

module.exports.home = async function (req, res) {
  try {
    //changes ::populate the likes of each post and comments
    let posts = await Post.find({})
      .sort("-createdAt")
      .populate("user")
      .populate({
        path: "comments",
        populate: {
          path: "user",
        },
      })
      .populate({
        path: "comments",
        populate: {
          path: "likes",
        },
      }) //changing here
      .populate("likes");
    //here it is
    let user = "";
    if (req.user) {
      user = await User.findById(req.user.id).populate(
        "friends",
        "name avatar"
      );
    }
    let users = await User.find({});
    return res.render("home", {
      title: "Codeial | Home",
      posts: posts,
      all_users: users,
      user: user,
    });
    // return res.status(200).send({
    //   message: "List of posts",
    // posts: [
    //   {
    //     content: "Hi Its Harsh Prasad",
    //     user: {
    //       friendships: [],
    //       _id: "6276c2685fb61471d6557346",
    //       name: "Harsh Prasad",
    //       email: "harshisindian@gmail.com",
    //       password: "2503",
    //       createdAt: "2022-05-07T19:03:04.913Z",
    //       updatedAt: "2022-05-07T19:03:04.913Z",
    //       __v: 0,
    //     },
    //     createdAt: "2022-05-10T11:12:34.739Z",
    //     updatedAt: "2022-05-10T11:13:40.126Z",
    //     __v: 4,
    //   },
    //   {
    //     content: "2ndHi Its Harsh Prasad",
    //     user: {
    //       friendships: [],
    //       _id: "6276c2685fb61471d6557346",
    //       name: "Harsh Prasad",
    //       email: "harshisindian@gmail.com",
    //       password: "2503",
    //       createdAt: "2022-05-07T19:03:04.913Z",
    //       updatedAt: "2022-05-07T19:03:04.913Z",
    //       __v: 0,
    //     },
    //     createdAt: "2022-05-10T11:12:34.739Z",
    //     updatedAt: "2022-05-10T11:13:40.126Z",
    //     __v: 4,
    //   },
    // ],
    //  });
  } catch (error) {
    console.log("error", error);
    return;
  }
};
