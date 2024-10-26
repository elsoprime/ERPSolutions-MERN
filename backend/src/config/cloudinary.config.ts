/** Autor: @elsoprimeDev */

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImage = async (imageUrl, publicId) => {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      public_id: publicId,
    });
    return result;
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
};

const optimizeImage = (publicId) => {
  return cloudinary.url(publicId, { fetch_format: "auto", quality: "auto" });
};

const transformImage = (publicId, width, height) => {
  return cloudinary.url(publicId, {
    crop: "auto",
    gravity: "auto",
    width,
    height,
  });
};

(async () => {
  const imageUrl =
    "https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg";
  const publicId = "shoes";

  const uploadResult = await uploadImage(imageUrl, publicId);
  console.log("Upload Result:", uploadResult);

  const optimizedUrl = optimizeImage(publicId);
  console.log("Optimized Image URL:", optimizedUrl);

  const croppedUrl = transformImage(publicId, 500, 500);
  console.log("Cropped Image URL:", croppedUrl);
})();
