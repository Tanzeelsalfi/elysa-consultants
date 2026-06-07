import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Uploads a file buffer or base64 string to Cloudinary
 * @param fileBuffer Buffer representation of the file
 * @param folder Cloudinary folder name
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string = "elysa_consultants"
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result.secure_url);
        } else {
          reject(new Error("Cloudinary upload returned empty result"));
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
}

/**
 * Deletes an image from Cloudinary using its secure URL
 * @param imageUrl The full secure URL of the image
 */
export async function deleteFromCloudinary(imageUrl: string): Promise<void> {
  try {
    if (!imageUrl.includes("cloudinary.com")) return;
    
    // Extract public ID from Cloudinary URL
    // e.g. https://res.cloudinary.com/cloudName/image/upload/v12345/folder/imageId.jpg
    const parts = imageUrl.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return;

    // Public ID starts after the version (v12345) or upload.
    // We take all parts after the version tag.
    let publicIdWithExtension = parts.slice(uploadIndex + 2).join("/");
    // Remove file extension
    const dotIndex = publicIdWithExtension.lastIndexOf(".");
    const publicId = dotIndex !== -1 ? publicIdWithExtension.substring(0, dotIndex) : publicIdWithExtension;

    await cloudinary.uploader.destroy(publicId);
    console.log(`Successfully deleted image from Cloudinary: ${publicId}`);
  } catch (error) {
    console.error("Failed to delete image from Cloudinary:", error);
  }
}

export default cloudinary;
