import React, { useRef, useState, useEffect, useCallback } from "react";
import { uploadImage } from "./api";
import styles from "./CameraFeed.module.css";
import Webcam from "react-webcam";

const CameraFeed = ({ onCameraStateChange = () => {} }) => {
  const [prediction, setPrediction] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const prevFrameRef = useRef(null);
  const webcamRef = useRef(null);
  const [selectedBin, setSelectedBin] = useState(1);
  let frameProcessingInterval = null;
  const THRESHOLD = 7000000;
  const [instructionText, setInstructionText] = useState(
    "Place an item in front of the camera to watch the magic happen!"
  );
  const selectedBinRef = useRef(null); // Use useRef instead of useState

  const dynamicWebcamSize = () => {
    return [
      Math.floor(6 * window.screen.height / 8), 
      Math.floor(6 * window.screen.width / 8)
    ]
  };

  const videoConstraints = {
    "height":dynamicWebcamSize()[0],
    "width":dynamicWebcamSize()[1]
  }
  
  const renderVideoCSS = () => {
    const size = dynamicWebcamSize();
    console.log("size", size);
    styles.cameraContainer = {
      ...styles.cameraContainer, 
      ["height"]:size[0],
      ["width"]:size[1]
    };
  };
  renderVideoCSS();

  const WebcamComponent = () => {
    console.log(dynamicWebcamSize());
    return <Webcam
      audio={false}
      screenshotFormat='image/jpeg'
      videoConstraints={videoConstraints}
    />
  };

  const [imgSrc, setImgSrc] = useState(null);

  // create a capture function
  const capture = useCallback(() => {
    const imageSrc = getScreenshot();
    setImgSrc(imageSrc);
  }, [webcamRef]);

  const retake = () => {
    setImgSrc(null);
  };

  return (
    <div className={styles.cameraContainer}>
      <div className={styles.cameraBorder}>
        {imgSrc ? (
          <img src={imgSrc} alt="webcam" />
        ) : (
          <WebcamComponent />
        )}
      </div>
      {imgSrc ? (
          <button onClick={retake} className={styles.newButtonOnBottom} style={{ color: green }}>
            Retake?
          </button>
        ) : (
          <button onClick={capture} className={styles.newButtonOnBottom}>
            Click this for the magic to happen!
          </button>
        )}
    </div>
  );
};

export default CameraFeed;
