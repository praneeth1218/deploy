import React, { useContext, useState } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { Button, IconButton, TextField } from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import { AuthContext } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";

function HomeComponent() {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const { addToUserHistory } = useContext(AuthContext);
  const socket = useSocket();

  const handleJoinVideoCall = async () => {
    if (!meetingCode) {
        alert("Please enter a meeting code.");
        return;
    }

    const password = prompt("Please enter the meeting password:");
    if (!password) return;

    try {
       const response = await fetch("https://deploy-w9cr.onrender.com/api/v1/meetings/join_meeting", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ meetingCode, password }),
});


        if (!response.ok) {
            const status = response.status;
            const text = await response.text(); // Capture the response text
            console.error("Error joining meeting:", status, text);
            alert(`Meeting join failed. Status: ${status}. Details: ${text}`);
            return;
        }

        const text = await response.text(); // Read response as text first
        let data;

        // Attempt to parse as JSON, but catch any parsing errors
        try {
            data = JSON.parse(text);
        } catch (parseError) {
            console.error("Failed to parse JSON:", parseError);
            alert("Failed to parse response from server. Please try again.");
            return;
        }

        // Handle the parsed data
        if (data) {
            alert(data.message || "Joined meeting successfully!");
            navigate(`/${meetingCode}`);
        } else {
            alert("An error occurred. Please try again.");
        }
    } catch (error) {
        console.error("Error joining meeting:", error);
        alert("Unable to join the meeting at this time. Please check the network or try again later.");
    }
};

  const handleCreateMeeting = async () => {
    const password = prompt("Please set a password for the meeting:");
    if (!password) return;

    console.log("Creating meeting with code:", meetingCode);
    console.log("Meeting password:", password);
 
    try {
      // Step 1: Create the meeting
      const response = await fetch("https://deploy-w9cr.onrender.com/api/add_to_activity", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
  body: JSON.stringify({ meeting_code: meetingCode, password }),
});


      console.log("Create Meeting Response status:", response.status);

      if (response.ok) {
        // Step 2: After creating the meeting, log it in user history
        await addToUserHistory(meetingCode, password);  // Call the function here to log the activity
        alert("Meeting created successfully!");
      } else {
        alert("Error creating meeting.");
      }
    } catch (error) {
      console.error("Error creating meeting:", error);
      alert("Unable to create the meeting at this time.");
    }
  };

  return (
    <>
      <div className="navBar">
        <div style={{ display: "flex", alignItems: "center" }}>
          <h2>LinkUp</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={() => navigate("/history")}>
            <RestoreIcon />
          </IconButton>
          <p>History</p>
          <Button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/auth");
            }}
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="meetContainer">
        <div className="leftPanel">
          <div>
            <h2>Providing Quality Video Call Just Like Quality Education</h2>
            <div style={{ display: "flex", gap: "10px" }}>
              <TextField
                onChange={(e) => setMeetingCode(e.target.value)}
                label="Meeting Code"
                variant="outlined"
              />
              <Button onClick={handleJoinVideoCall} variant="contained">
                Join
              </Button>
              <Button onClick={handleCreateMeeting} variant="contained">
                Create Meeting
              </Button>
            </div>
          </div>
        </div>
        <div className="rightPanel">
          <img srcSet="/logo3.png" alt="" />
        </div>
      </div>
    </>
  );
}

export default withAuth(HomeComponent);
