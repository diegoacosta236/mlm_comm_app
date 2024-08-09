import { MouseEvent, useEffect, useRef, useState } from "react";
import { BiText } from "react-icons/bi";
import { FaPlus } from "react-icons/fa";
import { MdSpatialAudio } from "react-icons/md";
import { RiArrowDropDownLine } from "react-icons/ri";
import "./ChannelList.css";
import ChannelListPopup from "./ChannelListPopup";

interface Channel {
  id: string;
  name: string;
  type: "TEXT" | "VOICE";
  onChannelSelect: (channelId: string, channelName: string) => void;
}

interface ChannelListProps {
  serverId: string;
  onChannelSelect: (channelId: string, channelName: string) => void;
}

const ChannelList = ({ serverId, onChannelSelect }: ChannelListProps) => {
  const [channels, setChannels] = useState<Channel[]>([]); // ui for creating/deleting
  const [serverName, setServerName] = useState<string>("Loading..."); // when server is loading
  const [loading, setLoading] = useState<boolean>(true); // for loading div
  const [newChannelName, setNewChannelName] = useState<string>("");
  const [newChannelType, setNewChannelType] = useState<"TEXT" | "VOICE">(
    "TEXT"
  );
  const [showTextChannelForm, setShowTextChannelForm] =
    useState<boolean>(false); // text channel creation
  const [showVoiceChannelForm, setShowVoiceChannelForm] =
    useState<boolean>(false); // voice channel creation
  const [popupVisible, setPopupVisible] = useState<boolean>(false); // pop up visibility
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  }); // pop up position
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null); // selects a channel
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  // const router = useRouter();

  // fetches server details so we set the name of the server
  useEffect(() => {
    const fetchServerDetails = async () => {
      try {
        const response = await fetch(`/api/servers/${serverId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch server: ${response.statusText}`);
        }
        const data = await response.json();
        const { server, role } = data;

        if (server && role) {
          setServerName(server.name);
          setIsAdmin(role === "ADMIN" || role === "MODERATOR");
        } else {
          throw new Error("Invalid response structure");
        }
      } catch (error) {
        console.error("Error loading server:", error);
        setServerName("Error loading server");
      }
    };

    // fetches the channels of the server
    const fetchChannels = async () => {
      try {
        const response = await fetch(`/api/channels?serverId=${serverId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch channels: ${response.statusText}`);
        }
        const data = await response.json();
        setChannels(data);
      } catch (error) {
        console.error("Error loading channels:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServerDetails();
    fetchChannels();
  }, [serverId]);

  const handleCreateChannel = async () => {
    // safety check, users should NOT create channels with empty names
    if (!newChannelName) {
      alert("Channel name cannot be empty");
      return;
    }

    if (isAdmin) {
      try {
        const response = await fetch("/api/channels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newChannelName,
            type: newChannelType,
            serverId,
          }),
        });
        if (!response.ok) {
          throw new Error(`Failed to create channel: ${response.statusText}`);
        }
        // new channel is created, and the ui is updated. the form is also reset
      const newChannel = await response.json();
      setChannels((prevChannels) => [...prevChannels, newChannel]);
      setNewChannelName("");
      setShowTextChannelForm(false);
      setShowVoiceChannelForm(false);
      setSelectedChannel(null); // Clear selectedChannel after creating
    } catch (error) {
      console.error("Error creating channel:", error);
    }
    } else{
      alert("You must be an admin to create channels");
      setShowTextChannelForm(false);
      setShowVoiceChannelForm(false);
    };
  };

  const handleEditChannelName = async () => {
    if (!selectedChannel || !newChannelName) return;

    if (isAdmin){
      try {
        const response = await fetch(`/api/channels/`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newChannelName,
            id: selectedChannel.id,
            type: selectedChannel.type,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to update channel: ${response.statusText}`);
        }

        // Update the channel name in the state
        setChannels((prevChannels) =>
          prevChannels.map((channel) =>
            channel.id === selectedChannel.id
              ? { ...channel, name: newChannelName }
              : channel
          )
        );

        setNewChannelName("");
        setShowTextChannelForm(false);
        setShowVoiceChannelForm(false);
      } catch (error) {
        console.error("Error updating channel:", error);
      }
    } else {
      alert("You must be an admin to edit channels");
      setShowTextChannelForm(false);
      setShowVoiceChannelForm(false);
    }
  };

  const handleDeleteChannel = async () => {
    if (!selectedChannel) return;

    if (isAdmin) {
      try {
        const response = await fetch(`/api/channels`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ channelId: selectedChannel.id }),
        });

        if (!response.ok) {
          throw new Error(`Failed to delete channel: ${response.statusText}`);
        }

        // once channel is deleted, the UI is updated, pop up closed, and channel state is null
        setChannels((prevChannels) =>
          prevChannels.filter((channel) => channel.id !== selectedChannel.id)
        );
        setPopupVisible(false);
        setSelectedChannel(null);
        onChannelSelect("", "");
      } catch (error) {
        console.error("Error deleting channel:", error);
      }
    } else {
      alert("You must be an admin to delete channels.")
    }
  };

  // right click for the pop up, sets the channel and also the position
  const handleChannelRightClick = (
    event: MouseEvent<HTMLDivElement>,
    channel: Channel
  ) => {
    event.preventDefault();
    if (event) {
      const { clientX, clientY } = event;
      setSelectedChannel(channel);
      setPopupPosition({ x: clientX, y: clientY });
      setPopupVisible(true);
    }
  };

  // similar to how server selection is handled
  const handleChannelClick = async (channelId: string, channelName: string) => {
    if (onChannelSelect) {
      onChannelSelect(channelId, channelName);
    }
    setNewChannelName(""); // Reset newChannelName
    const selectedChannel = channels.find(
      (channel) => channel.id === channelId
    );
    setSelectedChannel(selectedChannel || null);
    console.log("Channel selected:", selectedChannel);


    try {
      const response = await fetch(`/api/channels/${channelId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch channel: ${response.statusText}`);
      }
      const channel = await response.json();
      console.log('Channel details:', channel);
    } catch (error) {
      console.error("Error fetching channel:", error);
    }
  };

  // if the channels are loading, this is displayed. just makes it look nicer and not as empty
  if (loading) {
    return (
      <div className="ml-2 my-4 font-bold text-xl">Loading channels...</div>
    );
  }

  const textChannels = channels.filter((channel) => channel.type === "TEXT");
  const voiceChannels = channels.filter((channel) => channel.type === "VOICE");

  return (
    <div className="channel-list-container h-auto">
      {/* main container of everything, h is auto so the display isn't broken */}
      <div className="server-bar shadow-sm py-1 border-b-[1.5px] border-gray-400/opacity-50">
        {/* container of the server name */}
        <div className="server-name">{serverName}</div>
        <button className="flex justify-center">
          <RiArrowDropDownLine className="text-4xl" />{" "}
          {/* potentially make it so theres another invite pop up here, like in discord */}
        </button>
      </div>
      <div className="channel-types bg-white mt-4 h-full">
        <div className="text-channels">
          <div className="channel-type">
            Text Channels
            <button
              className="flex justify-center"
              onClick={() => {
                setNewChannelType("TEXT");
                setShowTextChannelForm(!showTextChannelForm);
                setShowVoiceChannelForm(false);
                setNewChannelName(""); // Reset newChannelName
                setSelectedChannel(null); // Clear selectedChannel
              }}
            >
              <FaPlus className="text-lg mr-4" />
            </button>
          </div>
          {textChannels.map((channel) => (
            <div
              key={channel.id}
              className={`channel-item ${
                selectedChannel?.id === channel.id ? "selected" : ""
              }`}
              onClick={() => handleChannelClick(channel.id, channel.name)}
              onContextMenu={(event) => handleChannelRightClick(event, channel)}
            >
              <BiText className="mr-2" />
              {channel.name}
            </div>
          ))}
          {showTextChannelForm && (
            <div className="create-channel-container flex justify-between mx-1 p-2 shadow-md">
              <div className="create-channel-form">
                <input
                  type="text"
                  placeholder="New Channel Name"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  className="input"
                />
                <button
                  onClick={() => {
                    if (
                      selectedChannel &&
                      (showTextChannelForm || showVoiceChannelForm)
                    ) {
                      handleEditChannelName();
                    } else {
                      handleCreateChannel();
                    }
                  }}
                  className="btn-create"
                >
                  {selectedChannel &&
                  (showTextChannelForm || showVoiceChannelForm)
                    ? "Edit Channel Name"
                    : "Create Channel"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="voice-channels mt-4">
          <div className="channel-type">
            Voice Channels
            <button
              className="flex justify-center"
              onClick={() => {
                setNewChannelType("VOICE");
                setShowVoiceChannelForm(!showVoiceChannelForm);
                setShowTextChannelForm(false);
                setNewChannelName(""); // Reset newChannelName
                setSelectedChannel(null); // Clear selectedChannel
              }}
            >
              <FaPlus className="text-lg mr-4" />
            </button>
          </div>
          {voiceChannels.map((channel) => (
            <div
              key={channel.id}
              className={`channel-item ${
                selectedChannel?.id === channel.id ? "selected" : ""
              }`}
              onClick={() => handleChannelClick(channel.id, channel.name)}
              onContextMenu={(event) => handleChannelRightClick(event, channel)}
            >
              <MdSpatialAudio className="mr-2" />
              {channel.name}
            </div>
          ))}
          {showVoiceChannelForm && (
            <div className="create-channel-container flex justify-between mx-1 p-2 shadow-md">
              <div className="create-channel-form">
                <input
                  type="voice"
                  placeholder="New Voice Name"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  className="input"
                />
                <button
                  onClick={() => {
                    if (
                      selectedChannel &&
                      (showTextChannelForm || showVoiceChannelForm)
                    ) {
                      handleEditChannelName();
                    } else {
                      handleCreateChannel();
                    }
                  }}
                  className="btn-create"
                >
                  {selectedChannel &&
                  (showTextChannelForm || showVoiceChannelForm)
                    ? "Edit Server Name"
                    : "Create Server"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {popupVisible && (
        <ChannelListPopup
          ChannelType={selectedChannel?.type!}
          position={popupPosition}
          onClose={() => setPopupVisible(false)}
          onDelete={handleDeleteChannel}
          onEdit={() => {
            setPopupVisible(false);

            if (selectedChannel) {
              setNewChannelName(selectedChannel.name);
              if (selectedChannel.type === "TEXT") {
                setShowTextChannelForm(true);
                setShowVoiceChannelForm(false);
              } else {
                setShowVoiceChannelForm(true);
                setShowTextChannelForm(false);
              }
            } else {
              setNewChannelName("");
              setShowTextChannelForm(false);
              setShowVoiceChannelForm(false);
            }
          }}
        />
      )}
    </div>
  );
};

export default ChannelList;
