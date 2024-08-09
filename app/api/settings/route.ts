import { NextRequest } from "next/server";
import prisma from "@/prisma/client";
import { currentUser } from "@/lib/current-user";

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      console.log("Unauthorized access attempt");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = user.id;
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        image: true,
        createdAt: true,
        settings: {
          select: {
            username: true,
            name: true,
            dob: true,
            business: true,
            memberSince: true,
            email: true,
            phone: true,
            country: true,
            language: true,
            about: true,
          },
        },
      },
    });

    if (!userData) {
      console.log("User not found for ID:", userId);
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (userData.settings === null) {
      userData.settings = {
        username: "",
        name: "",
        dob: "",
        business: "",
        memberSince: "",
        email: userData.email || "",
        phone: "",
        country: "",
        language: "",
        about: "",
      };
    } else if (!userData.settings.email) {
      userData.settings.email = userData.email || "";
    }

    console.log("Fetched user data:", userData);
    return new Response(JSON.stringify(userData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch user data" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      console.log("Unauthorized access attempt");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userId = user.id;
    const body = await req.json();
    const { settings, ...userData } = body;

    const userUpdateData: any = {};
    const settingsUpdateData: any = {};

    if (userData.image) userUpdateData.image = userData.image;

    if (settings.email) {
      userUpdateData.email = settings.email;
      settingsUpdateData.email = settings.email;
    }
    if (settings.name) {
      userUpdateData.name = settings.name;
      settingsUpdateData.name = settings.name;
    }

    Object.assign(settingsUpdateData, {
      about: settings.about,
      username: settings.username,
      dob: settings.dob,
      business: settings.business,
      memberSince: settings.memberSince,
      phone: settings.phone,
      country: settings.country,
      language: settings.language,
    });

    console.log("Updating user data:", userUpdateData);
    console.log("Updating settings data:", settingsUpdateData);

    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: userUpdateData,
      });
    }

    await prisma.settings.upsert({
      where: { userId: userId },
      update: settingsUpdateData,
      create: {
        userId: userId,
        username: settings.username || "",
        name: settings.name || "",
        dob: settings.dob || "",
        business: settings.business || "",
        memberSince: settings.memberSince || "",
        email: settings.email || "",
        phone: settings.phone || "",
        country: settings.country || "",
        language: settings.language || "",
        about: settings.about || "",
      },
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        settings: {
          select: {
            username: true,
            name: true,
            dob: true,
            business: true,
            memberSince: true,
            email: true,
            phone: true,
            country: true,
            language: true,
            about: true,
          },
        },
      },
    });

    console.log("Updated user data:", updatedUser);
    return new Response(JSON.stringify(updatedUser), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating user data:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update user data" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}