const express = require("express");

const {
    homeController,
    logoutController,
    coursesController,
    learningController,
    postuploadController,
    uploadController,
    regController,
    postregController,
    logController,
    postlogController,
    manageCoursesController,
    editCourseController,
    deleteCourseController
} = require("../controller/controller.js");

const upload = require("../middleware/multer.js");

const router = express.Router();

router.get("/", homeController);

router.get("/register", regController);

router.post("/register", postregController);

router.post("/login", postlogController);

router.get("/login", logController);

router.get("/logout", logoutController);

/*                                                                                 
--------------------------------------------------------------------------         
STUDENT COURSES                                                                    
--------------------------------------------------------------------------         
*/

router.get(
    "/courses/:id/learn",
    learningController
);

router.get(
    "/courses",
    coursesController
);
router.get("/terms", (req, res) => {
    res.render("others/terms")
});
router.get("/privacy", (req, res) => {
    res.render("others/privacy")
});
router.get("/contact", (req, res) => {
    res.render("others/contact", { user: req.user })
});
router.get("/about", (req, res) => {
        res.render("others/about", { user: req.user })
    })
    /*                                                                                 
    --------------------------------------------------------------------------         
    ADMIN COURSE UPLOAD                                                                
    --------------------------------------------------------------------------         
    */

router.get(
    "/admin/courses/upload",
    uploadController
);

router.post(
    "/admin/courses/upload",
    upload.fields([{
            name: "video",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    postuploadController
);

/*                                                                                 
--------------------------------------------------------------------------         
ADMIN MANAGE COURSES                                                               
--------------------------------------------------------------------------         
*/

router.get(
    "/admin/courses",
    manageCoursesController
);

/*                                                                                 
--------------------------------------------------------------------------         
ADMIN EDIT COURSE                                                                  
--------------------------------------------------------------------------         
*/

router.post(
    "/admin/courses/edit/:id",
    upload.fields([{
            name: "video",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    editCourseController
);

/*                                                                                 
         --------------------------------------------------------------------------         
         ADMIN DELETE COURSE                                                                
         --------------------------------------------------------------------------         
         */

router.post(
    "/admin/courses/delete/:id",
    deleteCourseController
);

module.exports = router;

console.log("All routes registered");