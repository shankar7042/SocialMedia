const Post = require("../models/Post");
const User = require("../models/User");

exports.createPost = async (req, res) => {
    try {
        const newPostData = {
            caption: req.body.caption,
            image: {
                public_id: "req.body.public_id",
                url: "req.body.url",
            },
            owner: req.userId,
        };

        const newPost = await Post.create(newPostData);
        const user = await User.findById(req.userId);
        user.posts.push(newPost._id);
        await user.save();
        res.status(201).json({ success: true, post: newPost });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        if (post.owner.toString() != req.userId.toString()) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        await post.delete();

        const user = await User.findById(req.userId);
        const index = user.posts.indexOf(req.params.id);
        user.posts.splice(index, 1);

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Post deleted",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.likeAndUnlikePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        if (post.likes.includes(req.userId)) {
            const index = post.likes.indexOf(req.userId);
            post.likes.splice(index, 1);
            await post.save();

            return res.status(200).json({
                success: true,
                message: "Post Unliked",
            });
        } else {
            post.likes.push(req.userId);
            await post.save();
            return res.status(200).json({
                success: true,
                message: "Post Liked",
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getPostOfFollowing = async (req, res) => {
    try {
        const loggedInUser = await User.findById(req.userId);
        const posts = await Post.find({
            owner: {
                $in: loggedInUser.following,
            },
        });
        return res.status(200).json({
            success: true,
            posts,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.updateCaption = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        if (post.owner.toString() != req.userId.toString()) {
            return res.status(400).json({
                success: false,
                message: "Unauthorized",
            });
        }

        post.caption = req.body.caption;

        await post.save();

        return res.status(200).json({
            success: true,
            message: "Post caption updated",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
