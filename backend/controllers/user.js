const User = require("../models/User");

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
