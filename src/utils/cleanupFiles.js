const cloudinary = require("cloudinary").v2;

/**
 * Remove a media file from Cloudinary
 * Handles both videos and images
 */
const removeCloudinaryFile = async (publicId, resourceType = "image") => {
  if (!publicId) {
    console.warn("⚠️  No public ID provided for removal");
    return { success: false, reason: "No public ID" };
  }

  try {
    console.log(`🗑️  Removing ${resourceType}: ${publicId}`);

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(
        publicId,
        {
          resource_type: resourceType,
          invalidate: true
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });

    console.log(`✅ Removed: ${publicId}`);
    return { success: true, result };
  } catch (error) {
    console.error(`❌ Failed to remove ${publicId}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Remove multiple files (e.g., video and thumbnail)
 * Used during rollback on upload failure
 */
const cleanupUploadedFiles = async (files = []) => {
  if (!Array.isArray(files)) {
    files = [files].filter(Boolean);
  }

  const results = await Promise.allSettled(
    files.map((file) =>
      removeCloudinaryFile(file.public_id, file.resource_type)
    )
  );

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(
        `⚠️  Failed to cleanup file ${index + 1}:`,
        result.reason.message
      );
    }
  });

  return results;
};

/**
 * Remove course media (video + thumbnail)
 * Used when editing or deleting courses
 */
const removeCourseMedia = async (videoPublicId, thumbnailPublicId) => {
  const results = await Promise.all([
    videoPublicId
      ? removeCloudinaryFile(videoPublicId, "video")
      : Promise.resolve({ success: true, skipped: true }),
    thumbnailPublicId
      ? removeCloudinaryFile(thumbnailPublicId, "image")
      : Promise.resolve({ success: true, skipped: true })
  ]);

  return {
    video: results[0],
    thumbnail: results[1],
    allSuccess: results.every((r) => r.success || r.skipped)
  };
};

module.exports = {
  removeCloudinaryFile,
  cleanupUploadedFiles,
  removeCourseMedia
};
