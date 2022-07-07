const User = require("../models/User");
const Post = require("../models/Post");

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let user = await User.findOne({ email });

        if (user) {
            return res
                .status(400)
                .json({ success: false, message: "User already exists" });
        }

        user = await User.create({
            name,
            email,
            password,
            avatar: { public_id: "samplepublic_id", url: "smapleurl" },
        });

        const token = user.generateToken();

        res.status(200)
            .cookie("token", token, {
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            })
            .json({
                success: true,
                user,
                token,
            });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User does not exist",
            });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect Password",
            });
        }

        const token = user.generateToken();

        res.status(200)
            .cookie("token", token, {
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            })
            .json({
                success: true,
                user,
                token,
            });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.logout = (req, res) => {
    try {
        return res
            .status(200)
            .cookie("token", null, {
                expires: new Date(Date.now()),
                httpOnly: true,
            })
            .json({
                success: true,
                message: "Logged out",
            });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.followUser = async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.id);
        const loggedInUser = await User.findById(req.userId);

        if (!userToFollow) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (loggedInUser.following.includes(userToFollow._id)) {
            const followingIndex = loggedInUser.following.indexOf(
                userToFollow._id
            );
            loggedInUser.following.splice(followingIndex, 1);

            const followerIndex = userToFollow.followers.indexOf(
                loggedInUser._id
            );
            userToFollow.followers.splice(followerIndex, 1);

            await loggedInUser.save();
            await userToFollow.save();

            return res.status(200).json({
                success: true,
                message: "User Unfollowed",
            });
        } else {
            loggedInUser.following.push(userToFollow._id);
            userToFollow.followers.push(loggedInUser._id);

            await loggedInUser.save();
            await userToFollow.save();

            return res.status(200).json({
                suceess: true,
                message: "User followed",
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("+password");

        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide old and new Password",
            });
        }

        const isMatch = await user.matchPassword(oldPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect old password",
            });
        }

        user.password = newPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password updated",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        const { name, email } = req.body;

        if (name) {
            user.name = name;
        }

        if (email) {
            user.email = email;
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: "User profile updated",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.deleteProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const postsIds = user.posts;
        const followerIds = user.followers;
        const followingIds = user.following;
        const userId = user._id;

        await user.remove();

        res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true,
        });

        for (let i = 0; i < postsIds.length; i++) {
            await Post.findByIdAndRemove(postsIds[i]);
        }

        for (let i = 0; i < followerIds.length; i++) {
            const follower = await User.findById(followerIds[i]);
            const index = follower.following.indexOf(userId);
            follower.following.splice(index, 1);

            await follower.save();
        }

        for (let i = 0; i < followerIds.length; i++) {
            const following = await User.findById(followingIds[i]);
            const index = following.followers.indexOf(userId);
            following.followers.splice(index, 1);

            await following.save();
        }

        return res.status(200).json({
            success: true,
            message: "User profile removed",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.myProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate("posts");

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate("posts");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();

        return res.status(200).json({
            success: true,
            users,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
