import React, { useContext, useState } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { Button, IconButton, TextField } from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import { AuthContext } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import server from '../environment';

function HomeComponent() {
    const navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const { addToUserHistory } = useContext(AuthContext);
    const socket = useSocket();

 // In home.jsx, update handleCreateMeeting:
 const handleCreateMeeting = async () => {
        const password = prompt("Please set a password for the meeting:");
        if (!password) return;

        try {
            const response = await fetch("/api/add_to_activity", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ meeting_code: meetingCode, password }),
            });

            console.log("Create Meeting Response:", response);

            if (!response.ok) {
                const errorText = await response.text();
                alert("Error creating meeting: " + errorText);
                return;
            }

            await addToUserHistory(meetingCode, password);
            alert("Meeting created successfully!");
        } catch (error) {
            console.error("Error creating meeting:", error);
            alert("Unable to create the meeting at this time.");
        }
    };

// Update handleJoinVideoCall:
// Update handleJoinVideoCall:
const handleJoinVideoCall = async () => {
    if (!meetingCode) {
        alert("Please enter a meeting code.");
        return;
    }

    const password = prompt("Please enter the meeting password:");
    if (!password) return;

    try {
        console.log("Attempting to join meeting with code:", meetingCode);
        
        const response = await fetch(`${server}/api/v1/meetings/join_meeting`, { // Add server URL and correct endpoint
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ 
                meetingCode: meetingCode,
                password: password 
            }),
        });

        if (!response) {
            alert("No response from server");
            return;
        }

        const responseText = await response.text();

        if (!responseText) {
            alert("Empty response from server");
            return;
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error("Failed to parse server response:", responseText);
            alert("Server response was not in the expected format");
            return;
        }

        if (response.status === 401) {
            alert(data.message || "Incorrect password. Please try again.");
            return;
        }

        if (response.status === 404) {
            alert(data.message || "Meeting not found. Please check the meeting code.");
            return;
        }

        if (!response.ok) {
            alert(data.message || "An error occurred. Please try again.");
            return;
        }

        alert("Joined meeting successfully!");
        navigate(`/${meetingCode}`);

    } catch (error) {
        console.error("Error joining meeting:", error);
        alert("Unable to join the meeting. Please try again later.");
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
          <img src="/logo3.png" alt="" />
        </div>
            </div>
        </>
    );
}

export default withAuth(HomeComponent);
