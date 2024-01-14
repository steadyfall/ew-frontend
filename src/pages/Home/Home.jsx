import React, { useState } from "react";
import { Link } from "react-router-dom";
import Factoid from "../../components/HomeComponents/Factoid/Factoid";
import CameraFeed from "../../components/HomeComponents/CameraFeed/CameraFeed";
import styles from "./Home.module.css";
import { IoEarthSharp, IoMenuSharp } from "react-icons/io5";
import { TbMichelinStarGreen } from "react-icons/tb";
import { FaBars } from "react-icons/fa";

const Home = () => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleItemDisposed = () => {
    window.alert("Success! Item successfully thrown in the bin!");
  };

  const handleApiResponse = (response) => {
    console.log("API Response:", response);
  };

  return (
    <div className={styles.container}>
      <div className={styles.stars}></div> {/* Stars layer */}
      {/* Wrap the FaBars icon with a Link component */}
      <Link to="/intro" className={styles.link}>
        <FaBars size={28} className={styles.barsIcon} />
      </Link>
      <h1 className={styles.title}>
        <span className={`${styles.icon} ${styles.flippedIcon}`}>
          <TbMichelinStarGreen size={48} />
        </span>
        EcoWiz
        <span className={styles.icon}>
          <TbMichelinStarGreen size={48} />
        </span>
      </h1>
      {/* Placeholder icon */}
      <CameraFeed
        onCameraStateChange={setIsCameraOpen}
        onItemDisposed={handleItemDisposed}
        onApiResponse={handleApiResponse}
      />
    </div>
  );
};

export default Home;
