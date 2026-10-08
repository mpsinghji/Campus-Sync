import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import Cookies from "js-cookie";

// Gentle floating animation
const floatGuy = keyframes`
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-8px) rotate(2deg);
  }
`;

// Friendly waving hand animation
const waveHand = keyframes`
  0%, 100% {
    transform: rotate(0deg);
  }
  20% {
    transform: rotate(-22deg);
  }
  40% {
    transform: rotate(12deg);
  }
  60% {
    transform: rotate(-18deg);
  }
  80% {
    transform: rotate(6deg);
  }
`;

// Subtle blinking eyes animation
const blinkEyes = keyframes`
  0%, 90%, 100% {
    transform: scaleY(1);
  }
  95% {
    transform: scaleY(0.1);
  }
`;

// Sparkle / pulse glow effect
const pulseSparkle = keyframes`
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.85);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
`;

const Container = styled.div`
  position: ${(props) => props.position || "fixed"};
  top: ${(props) => props.top || "22px"};
  right: ${(props) => props.right || "26px"};
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
  user-select: none;
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);

  &:hover {
    transform: scale(1.12);
  }

  &:active {
    transform: scale(0.96);
  }
`;

const GuyWrapper = styled.div`
  width: ${(props) => props.size || "54px"};
  height: ${(props) => props.size || "54px"};
  background: transparent !important;
  animation: ${floatGuy} 3.2s ease-in-out infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.25));

  svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  .animated-arm {
    transform-origin: 38px 34px;
    animation: ${waveHand} 2.6s ease-in-out infinite;
  }

  .animated-eyes {
    transform-origin: 25px 23px;
    animation: ${blinkEyes} 4s infinite;
  }

  .animated-sparkle {
    transform-origin: 44px 12px;
    animation: ${pulseSparkle} 1.8s ease-in-out infinite;
  }
`;

const TooltipBadge = styled.div`
  margin-top: 6px;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(8px);
  color: #38bdf8;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.3px;
  padding: 4px 9px;
  border-radius: 20px;
  border: 1px solid rgba(56, 189, 248, 0.35);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
  pointer-events: none;
  opacity: ${(props) => (props.showAlways ? 1 : 0)};
  transform: ${(props) => (props.showAlways ? "translateY(0)" : "translateY(-4px)")};
  transition: all 0.2s ease;

  ${Container}:hover & {
    opacity: 1;
    transform: translateY(0);
  }
`;

const AnimatedGuyPortal = ({
  destination = "/master-control",
  tooltip = "Master Control ⚡",
  size = "56px",
  position = "fixed",
  top = "22px",
  right = "26px",
  showAlways = false,
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();

    // If traveling to master-control, ensure Super Admin session is established
    if (destination.includes("master-control")) {
      const superAdminData = {
        email: "admin@campus-sync.com",
        name: "Super Admin",
        role: "admin",
        isSuperAdmin: true,
        designation: "Supreme Master",
        department: "Master Administration",
      };
      Cookies.set("adminData", JSON.stringify(superAdminData), { expires: 7, path: "/" });
    }

    navigate(destination);
  };

  return (
    <Container
      position={position}
      top={top}
      right={right}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={tooltip}
      role="button"
      aria-label={tooltip}
    >
      <GuyWrapper size={size}>
        <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Sparkle Magic Star (Top Right) */}
          <g className="animated-sparkle">
            <path
              d="M44 6L45.2 9.8L49 11L45.2 12.2L44 16L42.8 12.2L39 11L42.8 9.8L44 6Z"
              fill="#FBBF24"
            />
          </g>

          {/* Body / Tech Hoodie */}
          <path
            d="M14 47C14 38.5 20 35 26 35C32 35 38 38.5 38 47C38 49 36 50 26 50C16 50 14 49 14 47Z"
            fill="#0F172A"
          />
          {/* Hoodie Neon Trim */}
          <path
            d="M20 36L26 43L32 36"
            stroke="#14B8A6"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Left Resting Arm */}
          <path
            d="M14 38C12 40 11 44 13 47"
            stroke="#0F172A"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Animated Waving Right Arm */}
          <g className="animated-arm">
            <path
              d="M37 36C40 33 43 27 45 22"
              stroke="#0F172A"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            {/* Waving Hand with glove */}
            <circle cx="45" cy="21" r="3.5" fill="#FBBF24" />
            <circle cx="46.5" cy="18.5" r="1.5" fill="#FBBF24" />
          </g>

          {/* Head & Neck */}
          <circle cx="26" cy="33" r="4.5" fill="#FBBF24" />
          <circle cx="26" cy="23" r="11" fill="#FDE047" />

          {/* Cool Tech Hair / Beanie Cap */}
          <path
            d="M15.5 22C15.5 15.5 19.5 12 26 12C32.5 12 36.5 15.5 36.5 22C34 19 31 18 26 18C21 18 18 19 15.5 22Z"
            fill="#1E293B"
          />

          {/* Mini Gold Crown / Master Emblem */}
          <path
            d="M22 10L24 13L26 9L28 13L30 10L29.5 14H22.5L22 10Z"
            fill="#F59E0B"
            stroke="#D97706"
            strokeWidth="0.5"
          />

          {/* Animated Eyes */}
          <g className="animated-eyes">
            <circle cx="22" cy="22" r="1.6" fill="#0F172A" />
            <circle cx="30" cy="22" r="1.6" fill="#0F172A" />
            <circle cx="22.5" cy="21.5" r="0.5" fill="#FFFFFF" />
            <circle cx="30.5" cy="21.5" r="0.5" fill="#FFFFFF" />
          </g>

          {/* Cute Smile */}
          <path
            d="M23 26.5C24 28 28 28 29 26.5"
            stroke="#0F172A"
            strokeWidth="1.6"
            strokeLinecap="round"
          />

          {/* Rosy Cheeks */}
          <circle cx="19.5" cy="25" r="1.3" fill="#F87171" opacity="0.6" />
          <circle cx="32.5" cy="25" r="1.3" fill="#F87171" opacity="0.6" />

          {/* Master Badge on Chest */}
          <circle cx="26" cy="45" r="2.2" fill="#14B8A6" />
          <path d="M26 43.8L26.5 45L25.5 45Z" fill="#FFFFFF" />
        </svg>
      </GuyWrapper>

      <TooltipBadge showAlways={showAlways}>
        {tooltip}
      </TooltipBadge>
    </Container>
  );
};

export default AnimatedGuyPortal;
