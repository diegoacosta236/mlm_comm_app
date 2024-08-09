import { NextRequest, NextResponse } from 'next/server';
import { db as prisma } from "@/lib/db";
import { currentUser } from '@/lib/current-user';

export async function DELETE(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      console.error('User not authenticated');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { serverId } = await req.json();

    if (!serverId) {
      console.error('Missing serverId');
      return NextResponse.json({ error: 'Missing serverId' }, { status: 400 });
    }

    const server = await prisma.server.findUnique({
      where: { id: serverId },
    });

    if (!server) {
      console.error('Server not found');
      return NextResponse.json({ error: 'Server not found' }, { status: 404 });
    }

    const member = await prisma.member.findFirst({
      where: {
        serverId,
        userId: user.id,
      },
    });

    if (!member || member.role !== 'ADMIN') {
      console.error('User is not an admin of this server');
      return NextResponse.json({ error: 'You are not authorized to delete this server' }, { status: 403 });
    }

    // Start a transaction to ensure all deletions happen atomically
    await prisma.$transaction(async (prisma) => {
      // Delete all messages associated with the server's channels
      await prisma.message.deleteMany({
        where: {
          channel: {
            serverId: serverId,
          },
        },
      });

      // Delete all channels associated with the server
      await prisma.channel.deleteMany({
        where: {
          serverId: serverId,
        },
      });

      // Finally, delete the server
      await prisma.server.delete({
        where: { id: serverId },
      });
    });

    return NextResponse.json({ message: 'Server deleted.' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting server:', error);
    return NextResponse.json({ error: 'Failed to delete server' }, { status: 500 });
  }
};
