"use client";

import React, { useEffect, useRef, useState } from "react";
import MessageInput from "./components/message-column/MessageInput";
import MessageNav from "./components/message-column/MessageNav";
import ExistingUserMessages from "./components/message-column/Messages";
import axios from "axios";
import { StaticImageData } from "next/image";
import { currentUser } from "@/lib/current-user";
import DefaultDisplay from "./components/message-column/DefaultDisplay";

interface Message {
  time: string;
  date: string;
  text: string;
  id: string;
  createdAt: Date;
}

interface NEWUserMessage {
  name: string;
  img: StaticImageData | string | null;
  userID: string;
  messages: Message[];
}

interface MessageLogProps {
  channelName: string;
  channelId: string | null;
  userId: string | null;
  userName: string;
}

const MessageLog = ({ channelName, channelId, userId, userName }: MessageLogProps) => {
  const avatar = "https://cdn4.iconfinder.com/data/icons/office-thick-outline/36/office-14-256.png"

  const [userMessages, setUserMessages] = useState<NEWUserMessage[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [currentUserImage, setCurrentUserImage] = useState<string | StaticImageData>(avatar);
  const [selectedChannelName, setSelectedChannelName] = useState<string>(channelName);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(channelId);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(userId);
  const [selectedUserName, setSelectedUserName] = useState<string>(userName);
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const user = await currentUser();
      if (user) {
        setCurrentUserId(user.id);
        setCurrentUserImage(user.image || avatar);
      } else {
        console.error("User is not authenticated");
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (channelId) {
          setSelectedChannelId(channelId);
          setSelectedChannelName(channelName);
          setSelectedUserId(null);
          scrollToBottom();


          const response = await axios.get(`/api/channels/${channelId}`);
          const channel = response.data;
          const messages = channel.messages;
          console.log("Fetched channel messages:", messages);

          const newMessages = convertToUserMessages(messages);
          if (JSON.stringify(newMessages) !== JSON.stringify(userMessages)) {
            setUserMessages(newMessages);
            scrollToBottom();
          }
        } else if (userId) {
          setSelectedUserId(userId);
          setSelectedUserName(userName);
          setSelectedChannelId(null);
          scrollToBottom();

          const response = await axios.get(`/api/directMessages/${userId}`);
          const messages = response.data;
          console.log("Fetched direct messages:", messages);

          const newMessages = convertToUserMessages(messages);
          if (JSON.stringify(newMessages) !== JSON.stringify(userMessages)) {
            setUserMessages(newMessages);
            scrollToBottom();
          }
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    const intervalId = setInterval(fetchMessages, 5000);

    return () => clearInterval(intervalId);
  }, [channelId, userId, userMessages, channelName, userName]);

  const createNewMessage = async (content: string): Promise<string | null> => {
    const user = await currentUser();

    if (!user) {
      console.error("Unauthorized access");
      return null;
    }

    try {
      let response;
      if (selectedChannelId) {
        response = await fetch(`/api/directMessages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, channelId, userId: user.id }),
        });
      } else if (selectedUserId) {
        response = await fetch(`/api/directMessages/${selectedUserId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });
      }

      if (response && response.ok) {
        const data = await response.json();
        console.log("Message created:", data);
        return data.id;
      } else if (response) {
        const errorData = await response.json();
        console.error("Failed to create message:", errorData);
      }
      return null;
    } catch (error) {
      console.error("Failed to create message:", error);
      return null;
    }
  };

  const sendMessage = async (message: string): Promise<void> => {
    try {
      const userId = currentUserId;

      if (selectedChannelId || selectedUserId) {
        const messageId = await createNewMessage(message);
        if (messageId != null) {
          updateLocalMessages(userId, message, messageId);
          scrollToBottom();
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const updateLocalMessages = (userId: string, message: string, messageId: string) => {
    const copyNewUserMessages = [...userMessages];
    const currentTime = new Date().toISOString();

    const newMessage = {
      time: formatTime(currentTime),
      date: formatDate(currentTime),
      text: message,
      id: messageId,
      createdAt: new Date(currentTime),
    };

    // Check if the last entry in userMessages is for the same user
    if (
      copyNewUserMessages.length > 0 &&
      copyNewUserMessages[copyNewUserMessages.length - 1].userID === userId
    ) {
      copyNewUserMessages[copyNewUserMessages.length - 1].messages.push(newMessage);
    } else {
      const user = copyNewUserMessages.find((userMessage) => userMessage.userID === userId);
      const userName = user ? user.name : "User";
      const userImg = user ? user.img : currentUserImage;

      copyNewUserMessages.push({
        name: userId === currentUserId ? "You" : userName,
        img: userId === currentUserId ? currentUserImage : userImg,
        userID: userId,
        messages: [newMessage],
      });
    }

    setUserMessages(copyNewUserMessages);
  };

  const convertToUserMessages = (messages: Array<any>): NEWUserMessage[] => {
    const convertedUserMessages: NEWUserMessage[] = [];
    let lastUserID: string = "";
    let currentUserMessage: NEWUserMessage = {
      name: "User",
      messages: [],
      img: null,
      userID: "",
    };

    messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    messages.forEach((message) => {
      if (message.userId === lastUserID) {
        currentUserMessage.messages.push(convertMessageBody(message));
      } else {
        if (lastUserID !== "") {
          convertedUserMessages.push(currentUserMessage);
        }
        currentUserMessage = {
          name: message.userId === currentUserId ? "You" : message.user.name,
          img: message.user.image || avatar,
          userID: message.userId,
          messages: [convertMessageBody(message)],
        };
        lastUserID = message.userId;
      }
    });

    if (currentUserMessage.messages.length > 0) {
      convertedUserMessages.push(currentUserMessage);
    }
    return convertedUserMessages;
  };

  const convertMessageBody = (message: any): Message => {
    return {
      time: formatTime(message.createdAt),
      date: formatDate(message.createdAt),
      text: message.content,
      id: message.id,
      createdAt: new Date(message.createdAt),
    };
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/Los_Angeles",
    };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  };

  const scrollToBottom = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const organizeMessagesByDate = (userMessages: NEWUserMessage[]) => {
    const organizedMessages: (NEWUserMessage | { date: string })[] = [];
    let lastDate: string | null = null;

    userMessages.forEach((userMessage) => {
      userMessage.messages.forEach((message) => {
        const messageDate = message.date;

        if (lastDate !== messageDate) {
          organizedMessages.push({ date: messageDate });
          lastDate = messageDate;
        }

        // Check if the last entry is from the same user
        const lastUserMessage = organizedMessages[organizedMessages.length - 1];
        if (
          lastUserMessage &&
          "userID" in lastUserMessage &&
          lastUserMessage.userID === userMessage.userID
        ) {
          (lastUserMessage as NEWUserMessage).messages.push(message);
        } else {
          organizedMessages.push({
            ...userMessage,
            messages: [message],
          });
        }
      });
    });

    return organizedMessages;
  };

  const organizedMessages = organizeMessagesByDate(userMessages);

  return (
    <>
      {!selectedChannelId && !selectedUserId ? (
        <DefaultDisplay />
      ) : (
        <>
          <MessageNav
            channelName={selectedChannelId ? selectedChannelName : selectedUserName || "Direct Messages"}
            channelId={selectedChannelId}
          />
          <div className="flex flex-col justify-between h-full">
            <div className="overflow-auto flex-grow h-[490px] max-h-screen">
              {organizedMessages.map((message, index) =>
                "date" in message ? (
                  <div key={index} className="relative text-center my-2 text-lime-500">
                    <div className="flex items-center">
                      <div className="flex-grow h-px bg-lime-500"></div>
                      <span className="px-4">{message.date}</span>
                      <div className="flex-grow h-px bg-lime-500"></div>
                    </div>
                  </div>
                ) : (
                  <ExistingUserMessages
                    key={index}
                    img={message.img || avatar}
                    name={message.name}
                    userID={message.userID}
                    messages={message.messages}
                  />
                )
              )}
              <div ref={messageEndRef} />
            </div>
            <div className="px-2 border-t">
              <MessageInput onSendMessage={sendMessage} />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MessageLog;
