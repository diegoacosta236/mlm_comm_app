"use client";

import React, { useState } from "react";
import { IoPersonCircleOutline } from "react-icons/io5";
import { CldImage } from "next-cloudinary";
import styles from "./UploadImage.module.css";
import axios from "axios";

interface ImageUploadProps {
  userId: string;
  onClose: () => void;
  onUpload: (imageUrl: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  userId,
  onClose,
  onUpload,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setSelectedFile(files[0]);
    setPreviewUrl(URL.createObjectURL(files[0]));
  };

  const uploadImage = async () => {
    if (!selectedFile) return;

    const data = new FormData();
    data.append("file", selectedFile);
    data.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );

    try {
      const res = await axios.put(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        data
      );

      if (res.status !== 200) {
        throw new Error("Failed to upload image to Cloudinary");
      }

      const file = res.data;
      setPreviewUrl(file.secure_url);

      const updateRes = await axios.post("/api/upload", {
        userId,
        imageUrl: file.secure_url,
      });

      if (updateRes.status !== 200) {
        throw new Error("Error updating user image");
      }

      setMessage("Profile image updated");
      onUpload(file.secure_url);
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const deleteImage = async () => {
    try {
      const deleteRes = await axios.post("/api/deleteImage", {
        userId,
      });

      if (deleteRes.status !== 200) {
        throw new Error("Error deleting user image");
      }

      setPreviewUrl(null);
      console.log("User image deleted successfully");
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainContainer}>
        <div className="flex flex-col items-center gap-4 max-w-full w-[345px]">
          <div className="flex relative w-38 h-38 rounded-full overflow-hidden">
            <div className="flex relative w-full h-full">
              {previewUrl ? (
                <CldImage
                  loading="lazy"
                  src={previewUrl}
                  alt="User Profile"
                  height={180}
                  width={180}
                  className="object-cover"
                />
              ) : (
                <IoPersonCircleOutline
                  className="default-picture"
                  size={"300px"}
                />
              )}
            </div>
          </div>
        </div>
        {previewUrl && (
          <button
            className="mt-4 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-700"
            onClick={deleteImage}
          >
            Delete Picture
          </button>
        )}

        <div className="flex justify-center mt-4">
          <input
            type="file"
            onChange={handleFileChange}
            className="
              block w-[250px] text-md text-white ml-4 font-bold tracking-wide
              file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 
              file:text-md file:font-semibold file:bg-blue-50 file:text-blue-700 
              hover:file:bg-blue-100
              file:cursor-pointer cursor-pointer
            "
          />
        </div>

        {selectedFile && (
          <div className="flex justify-center space-x-4 mt-4">
            <button
              onClick={uploadImage}
              className="
                flex justify-center 
                bg-green-800 text-white py-2 px-4 rounded-xl 
                w-20 font-bold
                hover:bg-green-500
                hover:text-green-900
              "
            >
              Save
            </button>
            <button
              onClick={onClose}
              className="
                flex justify-center 
                bg-gray-500 text-white py-2 px-4 rounded-xl 
                w-20 font-bold
                hover:bg-gray-600
              "
            >
              Cancel
            </button>
          </div>
        )}

        {message && (
          <div className="mt-4 text-center text-green-600 font-semibold">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;