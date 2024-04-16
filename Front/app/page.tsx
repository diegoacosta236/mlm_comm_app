

'use client';
import React, { useState } from "react";
import UserList, {generateUserList} from "../dm-list/dm-list"; // Importing UserList component
export default function Home() {

 
  const userList = generateUserList(13);

  return (
    <div className="project-container">
      <nav className="navbar">Navbar</nav>
      <div className="main-rows">
        <div className="side-channels-container"></div>
        <div className="direct-messages-container"></div>
        <div className="message-log-container"> 
            <MessageLog />
        </div>
        <div className="side-channels-container">
          <div className="messages-bar">
              <div className="w-[360px] h-[74px] left-0 top-0 absolute border-opacity-25">
              </div>
          </div>
        </div>
        <div className="direct-messages-container relative">
      
          {/* Render UserList component */}
          <UserList userList={userList} />
        </div>
        <div className="message-log-container"></div>
      </div>
    </div>

  );
}
