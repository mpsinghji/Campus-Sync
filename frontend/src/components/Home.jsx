import React from "react";
import {
  ButtonsContainer,
  LoginButton,
  HomeContainer,
  CollegeInfo,
  Title,
  CollegeVideo,
} from "../styles/styles.js";
import { useNavigate } from "react-router-dom";
import backgroundVideo from "../assets/background_video.mp4";

const Home = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/choose-user");
  };

  return (
    <>
      <HomeContainer>
        <CollegeVideo>
          <video
            loop
            autoPlay
            muted
            style={{
              position: "absolute",
              top: "0",
              left: "0",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              zIndex: -1,
            }}
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
        </CollegeVideo>
        <CollegeInfo>
          <Title>College Management System</Title>
        </CollegeInfo>
        <ButtonsContainer>
          <LoginButton onClick={handleLoginClick}>Sign In</LoginButton>
        </ButtonsContainer>
      </HomeContainer>
    </>
  );
};

export default Home;
