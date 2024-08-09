"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import ImageUpload from "../components/ImageUpload"; // Correct relative path
import { IoPersonCircleOutline } from "react-icons/io5";
import { TfiHome } from "react-icons/tfi";
import SectionHeading from "./_components/SectionHeading";
import SettingInputField from "./_components/SettingInputField";
import Image from "next/image";

const AccountSettings: React.FC = () => {
  const [settingsData, setSettingsData] = useState<any>(null);
  const [originalData, setOriginalData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showImageUpload, setShowImageUpload] = useState(false);

  const fetchSettingsData = async () => {
    try {
      const response = await axios.get("/api/settings");
      console.log("Fetched settings data:", response.data);

      const createdAt = new Date(response.data.createdAt);
      const isValidDate = !isNaN(createdAt.getTime());

      const formattedDate = isValidDate
        ? `${createdAt.getFullYear()}-${(createdAt.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${createdAt
            .getDate()
            .toString()
            .padStart(2, "0")}`
        : "";

      console.log("Formatted createdAt:", formattedDate);

      setSettingsData({
        ...response.data,
        settings: {
          ...response.data.settings,
          memberSince: formattedDate,
        },
      });
      setOriginalData({
        ...response.data,
        settings: {
          ...response.data.settings,
          memberSince: formattedDate,
        },
      });
    } catch (error) {
      console.error("Error fetching settings data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsData();
  }, []);

  const handleSaveClick = async () => {
    try {
      await axios.put("/api/settings", settingsData);
      console.log("Settings data updated successfully");
      setOriginalData(settingsData); // Update original data to match current settings
    } catch (error) {
      console.error("Error saving settings data:", error);
    }
  };

  const handleCancelClick = () => {
    setSettingsData(originalData);
  };

  const handleInputChange = (field: string, value: string) => {
    setSettingsData({
      ...settingsData,
      settings: { ...settingsData.settings, [field]: value },
    });
  };

  const handleOverlayClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (e.target === e.currentTarget) {
      setShowImageUpload(false);
    }
  };

  const handleImageUpload = async (imageUrl: string) => {
    setSettingsData({ ...settingsData, image: imageUrl });
    setShowImageUpload(false);
  };

  const hasChanges =
    JSON.stringify(settingsData) !== JSON.stringify(originalData);

  if (isLoading) {
    return (
      <div className="font-bold text-4xl flex justify-center mt-20">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen justify-center items-center bg-green-100">
      <div className="flex flex-col justify-center items-center border-4 px-7 py-6 rounded-lg border-green-700 bg-gradient-to-tl from-green-200 to-green-300 shadow-xl">
        <div className="flex flex-col sm:flex-row space-x-2">
          <div className="flex flex-col w-[19rem]">
            <div className="flex flex-col justify-center items-center ">
              <div
                className="relative h-32 w-32 rounded-full overflow-hidden hover:cursor-pointer"
                onClick={() => setShowImageUpload(true)}
              >
                {settingsData && settingsData.image ? (
                  <Image
                    src={settingsData.image}
                    alt="Profile"
                    layout="fill"
                    objectFit="cover"
                  />
                ) : (
                  <IoPersonCircleOutline className="text-9xl text-gray-700" />
                )}
              </div>

              <textarea
                value={settingsData?.settings?.about || ""}
                onChange={(e) => handleInputChange("about", e.target.value)}
                className="w-full mt-4 bg-transparent text-xl font-medium outline-none resize-none overflow-hidden text-center"
                placeholder="Tell us about yourself"
              />

              <button
                className="mt-3 px-3 py-2 font-medium text-gray-800 bg-emerald-400 rounded-xl hover:bg-emerald-500"
                onClick={() => setShowImageUpload(true)}
              >
                Change Profile Picture
              </button>

              {showImageUpload && (
                <div
                  className="fixed top-0 left-0 flex items-center justify-center w-full h-full bg-black bg-opacity-50"
                  onClick={handleOverlayClick}
                >
                  <div className="bg-white p-4 rounded-lg shadow-lg">
                    <ImageUpload
                      userId={settingsData?.id}
                      onClose={() => setShowImageUpload(false)}
                      onUpload={handleImageUpload}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col w-full m-auto mt-4">
              <SectionHeading>Region</SectionHeading>

              <SettingInputField
                label="Country"
                type="text"
                value={settingsData?.settings?.country || ""}
                onChange={(e) => handleInputChange("country", e.target.value)}
                placeholder="Country"
              />

              <SettingInputField
                label="Language"
                type="text"
                value={settingsData?.settings?.language || ""}
                onChange={(e) => handleInputChange("language", e.target.value)}
                placeholder="Language"
              />
            </div>
          </div>

          <div className="flex flex-col w-[19rem] mt-4 sm:mt-0">
            <SectionHeading>Basic Information</SectionHeading>

            <SettingInputField
              label="Username"
              type="text"
              name="username"
              value={settingsData?.settings?.username || ""}
              onChange={(e) => handleInputChange("username", e.target.value)}
              placeholder="Username"
            />

            <SettingInputField
              label="Name"
              type="text"
              name="name"
              value={settingsData?.settings?.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Name"
            />

            <SettingInputField
              label="Birthdate"
              type="text"
              name="dob"
              value={settingsData?.settings?.dob || ""}
              onChange={(e) => handleInputChange("dob", e.target.value)}
              placeholder="Date of Birth"
            />

            <SettingInputField
              label="Business"
              type="text"
              value={settingsData?.settings?.business || ""}
              onChange={(e) => handleInputChange("business", e.target.value)}
              placeholder="Business"
            />

            <SettingInputField
              label="Joined On"
              type="text"
              value={settingsData?.settings?.memberSince || ""}
              onChange={(e) => handleInputChange("memberSince", e.target.value)}
              placeholder="Member Since"
              readOnly
            />

            <SettingInputField
              label="Email"
              type="text"
              value={settingsData?.email || settingsData?.settings?.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Email"
              readOnly
            />

            <SettingInputField
              label="Phone"
              type="text"
              value={settingsData?.settings?.phone || ""}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="Phone Number"
            />
          </div>
        </div>

        {hasChanges && (
          <div className="flex justify-center mt-3 space-x-4">
            <button
              className="px-4 py-2 text-white bg-emerald-500 rounded-md hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
              onClick={handleSaveClick}
            >
              Save Changes
            </button>
            <button
              className="px-4 py-2 text-white bg-gray-500 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
              onClick={handleCancelClick}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-col items-center mt-4 group relative">
        <TfiHome
          className="w-10 h-10 text-green-900 hover:text-green-600 cursor-pointer"
          onClick={() => {
            window.location.href = "/";
          }}
        />
        <span
          className={`absolute left-12 top-0 mt-1 py-1 px-2 text-white bg-black rounded-md opacity-0 group-hover:opacity-100 transition-opacity delay-750 duration-300`}
        >
          Home
        </span>
      </div>
    </div>
  );
};

export default AccountSettings;