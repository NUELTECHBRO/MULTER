const User = require("../model/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const freecourse = require("../model/course.js");
const cloudinary = require("cloudinary").v2;

require("dotenv").config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

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
        return res.redirect("/login");

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

        res.cookie("xtp_site", token, {
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

        res.cookie("xtp_site", token, {
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



    res.clearCookie("xtp_site", {
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

    let video = null;
    let thumbnail = null;


    if (!req.admin) {
        await cleanupUploadedFiles(
            req.files && req.files.video ? req.files.video[0] : null,
            req.files && req.files.thumbnail ? req.files.thumbnail[0] : null
        );
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

        video =
            req.files &&
            req.files.video ?
            req.files.video[0] :
            null;

        thumbnail =
            req.files &&
            req.files.thumbnail ?
            req.files.thumbnail[0] :
            null;

        if (!title ||
            !category ||
            !level ||
            !description
        ) {
            await cleanupUploadedFiles(video, thumbnail);
            return res.status(400).send(
                "Please fill all course information"
            );
        }

        if (!video) {
            await cleanupUploadedFiles(thumbnail);
            return res.status(400).send(
                "Video is required"
            );
        }

        if (!thumbnail) {
            await cleanupUploadedFiles(video);
            return res.status(400).send(
                "Thumbnail is required"
            );
        }

        const coursedetails = {

            title: title.trim(),

            category: category.trim(),

            level: level.trim(),

            description: description.trim(),

            video: video.path,
            thumbnail: thumbnail.path,
            videoPublicId: video.public_id,
            thumbnailPublicId: thumbnail.public_id
        };

        await freecourse.create(
            coursedetails
        );

        return res.redirect("/");

    } catch (error) {

        await cleanupUploadedFiles(video, thumbnail);

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

const getCloudinaryPublicId = (mediaUrl) => {
    if (!mediaUrl || !mediaUrl.includes("res.cloudinary.com")) {
        return null;
    }

    const uploadMarker = "/upload/";
    const uploadIndex = mediaUrl.indexOf(uploadMarker);

    if (uploadIndex === -1) {
        return null;
    }

    const publicPath = mediaUrl
        .slice(uploadIndex + uploadMarker.length)
        .split("?")[0]
        .replace(/^v\d+\//, "");

    return publicPath.replace(/\.[^/.]+$/, "");
};

const removeCourseMedia = async(mediaUrl, resourceType, storedPublicId) => {
    const publicId = storedPublicId || getCloudinaryPublicId(mediaUrl);

    if (publicId) {
        await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
            invalidate: true
        });
        return;
    }

    if (!mediaUrl) {
        return;
    }

    const localPath = path.resolve(process.cwd(), "uploads", mediaUrl);

    if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
    }
};

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

        const previousVideo = {
            url: course.video,
            publicId: course.videoPublicId
        };

        const previousThumbnail = {
            url: course.thumbnail,
            publicId: course.thumbnailPublicId
        };

        if (video) {
            course.video = video.path;
            course.videoPublicId = video.public_id;
        }


        /*
         * If a new thumbnail was uploaded,
         * delete the old thumbnail first.
         */

        if (thumbnail) {
            course.thumbnail = thumbnail.path;
            course.thumbnailPublicId = thumbnail.public_id;
        }

        await course.save();

        if (video && previousVideo.url) {
            await removeCourseMedia(
                previousVideo.url,
                "video",
                previousVideo.publicId
            );
        }

        if (thumbnail && previousThumbnail.url) {
            await removeCourseMedia(
                previousThumbnail.url,
                "image",
                previousThumbnail.publicId
            );
        }

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

        await removeCourseMedia(
            course.video,
            "video",
            course.videoPublicId
        );


        /*
        |--------------------------------------------------------------------------
        | DELETE THUMBNAIL FROM UPLOADS
        |--------------------------------------------------------------------------
        */

        await removeCourseMedia(
            course.thumbnail,
            "image",
            course.thumbnailPublicId
        );


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

const cleanupUploadedFiles = async(...files) => {
    const uploadedFiles = files.filter(Boolean);

    await Promise.allSettled(
        uploadedFiles.map((file) => removeCourseMedia(
            file.path,
            file.resource_type,
            file.public_id
        ))
    );
};