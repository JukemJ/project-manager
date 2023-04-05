const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");

module.exports = {
  getProfile: async (req, res) => {
    try {
      const posts = await Post.find({ assigned: req.user.id });
      res.render("profile.ejs", { posts: posts, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getFeed: async (req, res) => {
    try {
      const posts = await Post.find().sort({ createdAt: "desc" }).lean();
      res.render("feed.ejs", { posts: posts, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      res.render("post.ejs", { post: post, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  createPost: async (req, res) => {
    try { 
      await Post.create({
        title: req.body.title,
        caption: req.body.caption,
        author: req.user.userName,
        authorId: req.user.id,
        completed: false,
        assigned: []
      });
      console.log("Post has been added!");
      res.redirect("/feed");
    } catch (err) {
      console.log(err);
    }
  },
  createPostWithImage: async (req, res) => {
    try {
      // Upload image to cloudinary
      
      const result = await cloudinary.uploader.upload(req.file.path)     

      await Post.create({
        title: req.body.title,
        image: result.secure_url,
        cloudinaryId: result.public_id,
        caption: req.body.caption,
        author: req.user.userName,
        authorId: req.user.id,
        completed: false,
        assigned: []
      });
      console.log("Post has been added!");
      res.redirect("/feed");
    } catch (err) {
      console.log(err);
    }
  },
  assignUserToTask: async (req, res) => {
    try {
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          $push: {assigned: req.user.color}
        }
      );
      console.log("Added User!");
      //res.redirect(`/post/${req.params.id}`);
      res.redirect("/feed");
    } catch (err) {
      console.log(err);
    }
  },
  removeUserFromTask: async (req, res) => {
    try {
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          $pullAll: {assigned: [req.user.color]}
        }
      );
      console.log("Removed User!");
      //res.redirect(`/post/${req.params.id}`);
      res.redirect("/feed");
    } catch (err) {
      console.log(err);
    }
  },
  markAsIncomplete: async (req, res) => {
    try {
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          completed: false
        }
      );
      console.log("Marked Incomplete!");
      //res.redirect(`/post/${req.params.id}`);
      res.redirect("/feed");
    } catch (err) {
      console.log(err);
    }
  },
  markAsComplete: async (req, res) => {
    try {
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          completed: true
        }
      );
      console.log("Marked Complete!");
      res.redirect("/feed");
    } catch (err) {
      console.log(err);
    }
  },
  deletePost: async (req, res) => {
    try {
      // Find post by id
      let post = await Post.findById({ _id: req.params.id });
      // Delete image from cloudinary
      if(post.cloudinaryId){    //checking if cloudinaryID exists
        await cloudinary.uploader.destroy(post.cloudinaryId);
      }
      // Delete post from db
      await Post.deleteOne({ _id: req.params.id });
      console.log("Deleted Post");
      res.redirect("/feed");
    } catch (err) {
      console.log(err)
      res.redirect("/profile");
    }
  }
}
