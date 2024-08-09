"use client";

import React, { useState } from "react";
import ImageUpload from "../components/ImageUpload"; // Correct relative path

const UploadPage: React.FC = () => {
  const userId = "your-user-id"; // Replace with actual user ID logic
  const [imageUrl, setImageUrl] = useState<string>("");

  const handleUpload = (url: string) => {
    setImageUrl(url);
    console.log("Uploaded image URL:", url);
  };

  const handleClose = () => {
    console.log("Upload modal closed");
  };

  return (
    <div>
      <h1>Upload Your Image</h1>
      <ImageUpload
        userId={userId}
        onClose={handleClose}
        onUpload={handleUpload}
      />
      {imageUrl && <p>Image uploaded: {imageUrl}</p>}
    </div>
  );
};

export default UploadPage;