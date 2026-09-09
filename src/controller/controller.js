const User = require("../model/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const freecourse = require("../model/course.js");

const homeController = async(req, res) => {
    try {



        // ADMIN
        if (req.admin) {
            return res.render("admin/home", {
                user: req.user
            });
        }

        // LOGGED-IN STUDENT
        if (req.user) {

            const data = await freecourse.find().lean();

            return res.render("students/home", {
                user: req.user,
                data
            });
        }

        // GUEST
        return res.render("guests/home", {
            user: null
        });

    } catch (error) {

        console.error("Home controller error:", error);

        return res.status(500).send("Failed to load home page");
    }



};

const coursesController = async(req, res) => {
    try {



        // LOGGED-IN STUDENT
        if (req.user) {

            const data = await freecourse.find().lean();

            return res.render("students/courses/courses", {
                user: req.user,
                data
            });
        }

        // GUEST
        return res.render("guests/home", {
            user: null
        });

    } catch (error) {

        console.error("Courses controller error:", error);

        return res.status(500).send("Failed to load courses page");
    }



};

/*
STUDENT LEARNING PAGE
*/
const learningController = async(req, res) => {



    try {

        // Student must be logged in
        if (!req.user) {
            return res.redirect("/login");
        }

        const courseId = req.params.id;

        // Find the selected course
        const course = await freecourse
            .findById(courseId)
            .lean();

        // Course doesn't exist
        if (!course) {
            return res.status(404).send("Course not found");
        }

        // Render learning page
        return res.render("students/courses/learn", {
            user: req.user,
            course
        });

    } catch (error) {

        console.error("Learning controller error:", error);

        return res.status(500).send(
            "Failed to load course"
        );
    }



};

const regController = (req, res) => {



    if (req.admin || req.user) {
        return res.redirect("/");
    }

    return res.render("auth/register");



};

const logController = (req, res) => {



    if (req.admin || req.user) {
        return res.redirect("/");
    }

    return res.render("auth/login");



};

const postregController = async(req, res) => {



    try {

        const {
            name,
            email,
            password
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).send(
                "You must fill all inputs"
            );
        }

        const user = await User.findOne({
            email
        });

        if (user) {
            return res.status(409).send(
                "User already exists"
            );
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword
        });

        const token = jwt.sign({
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            },
            process.env.JWTSECRET, {
                expiresIn: "1d"
            }
        );

        res.cookie("emma_app", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 30 * 60 * 1000
        });

        return res.redirect("/");

    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        return res.status(500).send(
            "Registration failed"
        );
    }



};

const postlogController = async(req, res) => {



    try {

        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).send(
                "You must fill all inputs"
            );
        }

        const user = await User.findOne({
            email
        });

        if (!user) {
            return res.status(401).send(
                "User is not registered"
            );
        }

        const compare =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!compare) {
            return res.status(401).send(
                "Invalid password"
            );
        }

        const token = jwt.sign({
                id: user._id,
                name: user.name,
                email: user.email
            },
            process.env.JWTSECRET, {
                expiresIn: "1d"
            }
        );

        res.cookie("emma_app", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 30 * 60 * 1000
        });

        return res.redirect("/");

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        return res.status(500).send(
            "Login failed"
        );
    }



};

const logoutController = (req, res) => {



    res.clearCookie("emma_app", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    });

    return res.redirect("/login");



};

const uploadController = (req, res) => {



    if (!req.admin) {
        return res.status(403).send(
            "Access denied"
        );
    }

    return res.render(
        "admin/courses/upload-course"
    );



};

const postuploadController = async(req, res) => {



    if (!req.admin) {
        return res.status(403).send(
            "Access denied"
        );
    }

    try {

        const {
            title,
            category,
            level,
            description
        } = req.body;

        const video =
            req.files &&
            req.files.video ?
            req.files.video[0] :
            null;

        const thumbnail =
            req.files &&
            req.files.thumbnail ?
            req.files.thumbnail[0] :
            null;

        if (!title ||
            !category ||
            !level ||
            !description
        ) {
            return res.status(400).send(
                "Please fill all course information"
            );
        }

        if (!video) {
            return res.status(400).send(
                "Video is required"
            );
        }

        if (!thumbnail) {
            return res.status(400).send(
                "Thumbnail is required"
            );
        }

        const coursedetails = {

            title: title.trim(),

            category: category.trim(),

            level: level.trim(),

            description: description.trim(),

            video: video.filename,

            thumbnail: thumbnail.filename
        };

        await freecourse.create(
            coursedetails
        );

        return res.redirect("/");

    } catch (error) {

        console.error(
            "Course upload error:",
            error
        );

        return res.status(500).send(
            "Failed to upload course"
        );
    }



};
const fs = require("fs");
const path = require("path");

const manageCoursesController = async(req, res) => {
    if (!req.admin) {
        return res.status(403).send("Access denied");
    }


    try {
        const data = await freecourse.find().sort({ _id: -1 }).lean();

        return res.render("admin/courses/manage-courses", {
            user: req.user,
            data
        });

    } catch (error) {
        console.error("Manage courses error:", error);
        return res.status(500).send("Failed to load courses");
    }


};

const editCourseController = async(req, res) => {
    if (!req.admin) {
        return res.status(403).send("Access denied");
    }


    try {
        const courseId = req.params.id;

        const course = await freecourse.findById(courseId);

        if (!course) {
            return res.status(404).send("Course not found");
        }

        const {
            title,
            category,
            level,
            description
        } = req.body;

        if (!title || !category || !level || !description) {
            return res.status(400).send("Please fill all course information");
        }

        course.title = title.trim();
        course.category = category.trim();
        course.level = level.trim();
        course.description = description.trim();

        const video =
            req.files && req.files.video ?
            req.files.video[0] :
            null;

        const thumbnail =
            req.files && req.files.thumbnail ?
            req.files.thumbnail[0] :
            null;


        /*
         * If a new video was uploaded,
         * delete the old video first.
         */

        if (video) {
            if (course.video) {
                const oldVideoPath = path.join(
                    __dirname,
                    "..",
                    "uploads",
                    course.video
                );

                if (fs.existsSync(oldVideoPath)) {
                    fs.unlinkSync(oldVideoPath);
                }
            }

            course.video = video.filename;
        }


        /*
         * If a new thumbnail was uploaded,
         * delete the old thumbnail first.
         */

        if (thumbnail) {
            if (course.thumbnail) {
                const oldThumbnailPath = path.join(
                    __dirname,
                    "..",
                    "uploads",
                    course.thumbnail
                );

                if (fs.existsSync(oldThumbnailPath)) {
                    fs.unlinkSync(oldThumbnailPath);
                }
            }

            course.thumbnail = thumbnail.filename;
        }

        await course.save();

        return res.redirect("/admin/courses");

    } catch (error) {
        console.error("Edit course error:", error);
        return res.status(500).send("Failed to edit course");
    }


};

const deleteCourseController = async(req, res) => {
    if (!req.admin) {
        return res.status(403).send("Access denied");
    }


    try {
        const courseId = req.params.id;

        const course = await freecourse.findById(courseId);

        if (!course) {
            return res.status(404).send("Course not found");
        }

        /*
        |--------------------------------------------------------------------------
        | DELETE VIDEO FROM UPLOADS
        |--------------------------------------------------------------------------
        */

        if (course.video) {

            const videoPath = path.resolve(
                process.cwd(),
                "uploads",
                course.video
            );

            console.log("Video to delete:", videoPath);

            if (fs.existsSync(videoPath)) {

                fs.unlinkSync(videoPath);

                console.log("Video deleted successfully:", videoPath);

            } else {

                console.log("Video file not found:", videoPath);

            }
        }


        /*
        |--------------------------------------------------------------------------
        | DELETE THUMBNAIL FROM UPLOADS
        |--------------------------------------------------------------------------
        */

        if (course.thumbnail) {

            const thumbnailPath = path.resolve(
                process.cwd(),
                "uploads",
                course.thumbnail
            );

            console.log("Thumbnail to delete:", thumbnailPath);

            if (fs.existsSync(thumbnailPath)) {

                fs.unlinkSync(thumbnailPath);

                console.log(
                    "Thumbnail deleted successfully:",
                    thumbnailPath
                );

            } else {

                console.log(
                    "Thumbnail file not found:",
                    thumbnailPath
                );

            }
        }


        /*
        |--------------------------------------------------------------------------
        | DELETE COURSE FROM DATABASE
        |--------------------------------------------------------------------------
        */

        await freecourse.findByIdAndDelete(courseId);

        console.log("Course deleted from database:", courseId);

        return res.redirect("/admin/courses");

    } catch (error) {

        console.error("Delete course error:", error);

        return res.status(500).send(
            "Failed to delete course"
        );
    }


};

module.exports = {
    logoutController,
    uploadController,
    postuploadController,
    coursesController,
    learningController,
    homeController,
    manageCoursesController,
    deleteCourseController,
    editCourseController,
    postregController,
    postlogController,
    logController,
    regController
};