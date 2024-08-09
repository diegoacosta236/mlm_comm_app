import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { currentUser } from "@/lib/current-user";

export async function DELETE(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { channelId } = await req.json();

    if (!channelId) {
      return NextResponse.json(
        { error: "Channel ID is required" },
        { status: 400 }
      );
    }

    // Delete messages associated with the channel first
    await prisma.message.deleteMany({
      where: { channelId: channelId },
    });

    // Then delete the channel
    await prisma.channel.delete({
      where: { id: channelId },
    });

    return NextResponse.json({ success: "Channel and its messages deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting channel:", error);
    return NextResponse.json(
      { error: "Error deleting channel" },
      { status: 500 }
    );
  }
}
