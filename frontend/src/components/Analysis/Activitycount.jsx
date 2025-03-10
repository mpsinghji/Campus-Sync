// ActivityGraph.jsx
import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import styled from "styled-components";

const GraphWrapper = styled.div`
  flex: 1; /* Adjust layout responsiveness */
  height: 400px; /* Fixed height for consistent sizing */
  max-height: 500px; /* Maximum height limit */
  width: 100%; /* Full width of parent container */
  max-width: 600px; /* Maximum width limit */
  background: #f9f9f9; /* Optional for contrast */
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  overflow: hidden; /* Prevent content from overflowing */
  margin: 0 auto; /* Center the graph */
`;


const ActivityGraph = () => {
  const [activityCounts, setActivityCounts] = useState({
    events: 0,
    assignments: 0,
    announcements: 0,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [eventsRes, assignmentsRes, announcementsRes] = await Promise.all(
          [
            axios.get("https://campus-sync-ez7y.onrender.com/api/v1/events/count"),
            axios.get("https://campus-sync-ez7y.onrender.com/api/v1/assignments/count"),
            axios.get("https://campus-sync-ez7y.onrender.com/api/v1/announcements/count"),
          ]
        );

        setActivityCounts({
          events: eventsRes.data.count,
          assignments: assignmentsRes.data.count,
          announcements: announcementsRes.data.count,
        });
      } catch (error) {
        console.error("Error fetching activity counts:", error);
      }
    };

    fetchCounts();
  }, []);

  const data = {
    labels: ["Events", "Assignments", "Announcements"],
    datasets: [
      {
        label: "Activity Count",
        data: [
          activityCounts.events,
          activityCounts.assignments,
          activityCounts.announcements,
        ],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <GraphWrapper>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <h2>Activity Graph</h2>
        <Bar data={data} options={options} />
      </div>
    </GraphWrapper>
  );
};

export default ActivityGraph;
