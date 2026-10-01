const User = require("../model/User.js");
const Enrollment = require("../model/Enrollment.js");
const mongoose = require("mongoose");
const adminEmails = require("../config/adminEmails.js");
const bcrypt = require("bcryptjs");
const freecourse = require("../model/course.js");
const cloudinary = require("cloudinary").v2;
const genToken = require("../utils/genToken.js");
const {CLOUDINARY_API_KEY,NODE_ENV,CLOUDINARY_API_SECRET,JWTSECRET,CLOUDINARY_CLOUD_NAME} = require("../config/env.js");
const genCookie = require("../utils/genCookie.js");
const genUser = require("../lib/User.js");

const getMonthlyStats = async (Model, now = new Date(), filter = {}) => {
    const currentMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const nextMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    const previousMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
    const monthlyCounts = await Model.aggregate([
        {
            $addFields: {
                statCreatedAt: { $ifNull: ["$createdAt", { $toDate: "$_id" }] }
            }
        },
        {
            $match: {
                ...filter,
                statCreatedAt: { $gte: previousMonthStart, $lt: nextMonthStart }
            }
        },
        {
            $group: {
                _id: {
                    $cond: [
                        { $gte: ["$statCreatedAt", currentMonthStart] },
                        "current",
                        "previous"
                    ]
                },
                count: { $sum: 1 }
            }
        }
    ]);
    const counts = new Map(monthlyCounts.map(({ _id, count }) => [_id, count]));
    const current = counts.get("current") || 0;
    const previous = counts.get("previous") || 0;

    const growth = previous === 0
        ? current === 0 ? 0 : null
        : ((current - previous) / previous) * 100;

    return { current, growth };
};

const getEnrollmentChart = async (now = new Date()) => {
    const months = Array.from({ length: 7 }, (_, index) =>
        new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 6 + index, 1))
    );
    const chartStart = months[0];
    const chartEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
    const monthlyEnrollments = await Enrollment.aggregate([
        { $match: { createdAt: { $gte: chartStart, $lt: chartEnd } } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                count: { $sum: 1 }
            }
        }
    ]);
    const enrollmentCounts = new Map(monthlyEnrollments.map(({ _id, count }) => [_id, count]));
    const monthFormatter = new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" });

    return months.map((month) => ({
        month: monthFormatter.format(month),
        count: enrollmentCounts.get(month.toISOString().slice(0, 7)) || 0
    }));
};


cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
});

const homeController = async (req, res) => {
    try {



        // ADMIN
        if (req.admin) {
            const now = new Date();
            const [data, totalStudents, totalEnrollments, studentMonthly, courseMonthly, enrollmentMonthly, enrollmentChart, courseEnrollmentCounts, recentStudents] = await Promise.all([
                freecourse.find().lean(),
                User.countDocuments({ email: { $nin: adminEmails } }),
                Enrollment.countDocuments(),
                getMonthlyStats(User, now, { email: { $nin: adminEmails } }),
                getMonthlyStats(freecourse, now),
                getMonthlyStats(Enrollment, now),
                getEnrollmentChart(now),
                Enrollment.aggregate([
                    { $group: { _id: "$course", count: { $sum: 1 } } }
                ]),
                User.find({ email: { $nin: adminEmails } }).sort({ createdAt: -1, _id: -1 }).limit(4).lean()
            ]);
            const categories = new Set(data
                .map((course) => typeof course.category === "string" ? course.category.trim() : "")
                .filter(Boolean));
            const enrollmentCounts = new Map(courseEnrollmentCounts.map(({ _id, count }) => [_id.toString(), count]));
            const topCourses = data
                .map((course) => ({
                    ...course,
                    enrollmentCount: enrollmentCounts.get(course._id.toString()) || 0
                }))
                .sort((first, second) =>
                    second.enrollmentCount - first.enrollmentCount || first.title.localeCompare(second.title)
                )
                .slice(0, 4);

            return res.render("admin/home", {
                user: req.user,
                data,
                recentStudents,
                topCourses,
                stats: {
                    totalStudents,
                    totalCourses: data.length,
                    totalEnrollments,
                    totalCategories: categories.size,
                    studentsThisMonth: studentMonthly.current,
                    coursesThisMonth: courseMonthly.current,
                    enrollmentsThisMonth: enrollmentMonthly.current,
                    studentGrowth: studentMonthly.growth,
                    courseGrowth: courseMonthly.growth,
                    enrollmentGrowth: enrollmentMonthly.growth,
                    enrollmentChart
                }
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

const coursesController = async (req, res) => {
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
const learningController = async (req, res) => {



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

        try {
            await Enrollment.updateOne(
                { student: req.user.id, course: course._id },
                { $setOnInsert: { student: req.user.id, course: course._id } },
                { upsert: true }
            );
        } catch (error) {
            if (error.code !== 11000) throw error;
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

const postregController = async (req, res) => {



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

        const newUser = await genUser(name, email, hashedPassword);

        const token = genToken(newUser._id, newUser.name, newUser.email);
        genCookie(res, token);


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

const postlogController = async (req, res) => {



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

        const token = genToken(user._id, user.name, user.email);

        genCookie(res, token);

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
        secure: NODE_ENV === "production",
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

const postuploadController = async (req, res) => {

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

const removeCourseMedia = async (mediaUrl, resourceType, storedPublicId) => {
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

const studentsController = async (req, res) => {
    if (!req.admin) {
        return res.status(403).send("Access denied");
    }

    try {
        const students = await User.find({ email: { $nin: adminEmails } })
            .sort({ createdAt: -1, _id: -1 })
            .lean();
        const enrollmentCounts = students.length
            ? await Enrollment.aggregate([
                { $match: { student: { $in: students.map((student) => student._id) } } },
                { $group: { _id: "$student", count: { $sum: 1 } } }
            ])
            : [];
        const countsByStudent = new Map(enrollmentCounts.map(({ _id, count }) => [_id.toString(), count]));
        const studentRows = students.map((student) => ({
            ...student,
            enrollmentCount: countsByStudent.get(student._id.toString()) || 0
        }));

        return res.render("admin/students", {
            user: req.user,
            students: studentRows,
            totalEnrollments: enrollmentCounts.reduce((total, enrollment) => total + enrollment.count, 0),
            studentDeleted: req.query.deleted === "1"
        });
    } catch (error) {
        console.error("Students page error:", error);
        return res.status(500).send("Failed to load students");
    }
};

const deleteStudentController = async (req, res) => {
    if (!req.admin) {
        return res.status(403).send("Access denied");
    }

    const studentId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return res.status(400).send("Invalid student ID");
    }

    try {
        const student = await User.findOne({
            _id: studentId,
            email: { $nin: adminEmails }
        }).select("_id");

        if (!student) {
            return res.status(404).send("Student not found");
        }

        await Enrollment.deleteMany({ student: student._id });
        await User.deleteOne({ _id: student._id });

        return res.redirect("/admin/students?deleted=1");
    } catch (error) {
        console.error("Delete student error:", error);
        return res.status(500).send("Failed to delete student");
    }
};

const manageCoursesController = async (req, res) => {
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

const editCourseController = async (req, res) => {
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

const deleteCourseController = async (req, res) => {
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

        await Enrollment.deleteMany({ course: course._id });
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
    studentsController,
    deleteStudentController,
    manageCoursesController,
    deleteCourseController,
    editCourseController,
    postregController,
    postlogController,
    logController,
    regController
};

const cleanupUploadedFiles = async (...files) => {
    const uploadedFiles = files.filter(Boolean);

    await Promise.allSettled(
        uploadedFiles.map((file) => removeCourseMedia(
            file.path,
            file.resource_type,
            file.public_id
        ))
    );
};