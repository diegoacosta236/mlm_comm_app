"use client";

import React, { useEffect, useState } from "react";
import MessageInput from "./components/message-column/MessageInput";
import MessageNav from "./components/message-column/MessageNav";
import ExistingUserMessages from "./components/message-column/Messages";
import avatar from "../public/avatar.png";
import axios from "axios";
import { StaticImageData } from "next/image";
import { currentUser } from "@/lib/current-user";


interface Message {
  time: string;
  text: string;
  id: string;
}

interface NEWUserMessage {
  name: string;
  img: StaticImageData | null;
  userID: string;
  messages: Message[];
}

interface MessageLogProps {
  channelName: string;
  channelId: string;
}

const MessageLog = ({ channelName, channelId } : MessageLogProps ) => { 
  const [userMessages, setUserMessages] = useState<NEWUserMessage[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [selectedChannelName, setSelectedChannelName] = useState<string>(channelName); // when server is loading;
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null); // when server is loading;

  const channelIDTemplate = `${channelId}`
  const channelNameTemplate = `${channelName}`

  useEffect(() => {
    const fetchChannelName = async() => {
      try {
        const response = await fetch(`/api/channels/${channelId}`);
        if (response.ok) {
          const channel = await response.json();
          setSelectedChannelName(channel.name);
          setSelectedChannelId(channelId); 
          console.log(`you are now in Channel: "${channelNameTemplate}", ID: ${channelIDTemplate}`);
        } else {
          throw new Error("Failed to load channel name");
        }
      } catch (error) {
        console.error("Error loading channel:", error);
        setSelectedChannelName("Error loading channel");
      }
    };

    fetchChannelName();
  }, [channelId]);

  const createNewMessage = async (content: string, channelId: string, userId: string): Promise<string | null> => {
    const user = await currentUser();

    if (!user) {
      console.error("Unauthorized access");
      return null;
    }

    try {
      const response = await fetch('/api/directMessages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, channelId, userId }),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Message created:', data);
        return data.id;
      } else {
        const errorData = await response.json();
        console.error('Failed to create message:', errorData);
        return null;
      }
    } catch (error) {
      console.error("Failed to create message:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const user = await currentUser();
      if (user) {
        setCurrentUserId(user.id);
        setUserMessages([
          {
            name: "Orchid",
            img: avatar,
            userID: user.id,
            messages: [],
          },
        ]);
      } else {
        console.error("User is not authenticated");
      }
    };

    fetchCurrentUser();
  }, []);

  const sendMessage = async (message: string): Promise<void> => {
    try {
      if (!selectedChannelId) {
        console.error("Channel ID is not set");
        return;
      }  else {
        console.log(`Message sent in "${channelName}", ID: ${channelIDTemplate}`)
      }

      const userId = currentUserId; // Using the dynamically fetched user ID
      const channelId = selectedChannelId;

      // Send the message to the server
      const messageId = await createNewMessage(message, channelId, userId);

      if (messageId != null) {
        const copyNewUserMessages = [...userMessages];
        if (copyNewUserMessages.length > 0 && copyNewUserMessages[copyNewUserMessages.length - 1].userID === userId) {
          copyNewUserMessages[copyNewUserMessages.length - 1].messages.push({
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: message,
            id: messageId
          });
        } else {
          copyNewUserMessages.push({
            name: 'Orchid',
            img: avatar,
            userID: userId,
            messages: [{
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              text: message,
              id: messageId
            }],
          });
        }
        // Update the local state to reflect the new message
        setUserMessages(copyNewUserMessages);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const convertToUserMessages = (messages: Array<any>): NEWUserMessage[] => {
    const convertedUserMessages: NEWUserMessage[] = [];
    let lastUserID: string = "";
    let currentUserMessage: NEWUserMessage = {
      name: "coffee",
      messages: [],
      img: null,
      userID: "3"
    };

    messages.forEach(message => {
      if (message.userId === lastUserID) {
        currentUserMessage.messages.push(convertMessageBody(message));
        return;
      }
      if (lastUserID !== "") {
        convertedUserMessages.push(currentUserMessage);
      }
      currentUserMessage = {
        name: "Orchid", // Replace with actual name from user data
        userID: message.userId,
        messages: [convertMessageBody(message)],
        img: null
      };
      lastUserID = message.userId;
    });

    if (currentUserMessage.messages.length > 0) {
      convertedUserMessages.push(currentUserMessage);
    }
    return convertedUserMessages;
  };

  const convertMessageBody = (message: any): Message => {
    const date = new Date(message.createdAt);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedTime = `${formattedHours}:${minutes} ${ampm}`;
    
    return {
      time: formattedTime,
      text: message.content,
      id: message.id
    };
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get('/api/directMessages');
        console.log(`Here are the fetched messages for "${channelNameTemplate}", ID: ${channelIDTemplate}`, response.data);
        setUserMessages(convertToUserMessages(response.data));
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (selectedChannelId) {
      fetchMessages();
    }
  }, [selectedChannelId]);

  return (
    <>
      <MessageNav channelName={selectedChannelName} channelId={selectedChannelId} />
      <div className="flex flex-col justify-between h-full">
        <div className="overflow-auto flex-grow max-h-[720px]">
          {userMessages.map((userMessage, index) => (
            <ExistingUserMessages
              key={index}
              img={userMessage.img || avatar}
              name={userMessage.name}
              userID={userMessage.userID}
              messages={userMessage.messages}
            />
          ))}
        </div>
        <MessageInput onSendMessage={sendMessage} />
      </div>
    </>
  );
};

export default MessageLog;