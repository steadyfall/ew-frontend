import React, { useRef, useState, useEffect } from "react";
import { uploadImage } from "./api";
import styles from "./CameraFeed.module.css";
import { get, ref, set } from "firebase/database";

const CameraFeed = ({ onCameraStateChange = () => {} }) => {
  const [prediction, setPrediction] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const prevFrameRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [selectedBin, setSelectedBin] = useState(1);
  let frameProcessingInterval = null;
  const THRESHOLD = 7000000;
  const [instructionText, setInstructionText] = useState(
    "Place an item in front of the camera to watch the magic happen!"
  );
  const selectedBinRef = useRef(1); // Use useRef instead of useState

  useEffect(() => {
    handleToggleCamera();
    return () => {
      clearInterval(frameProcessingInterval);
      onCameraStateChange(false);
    };
  }, []);

  const handleToggleCamera = async () => {
    if (!isCameraOpen) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoRef.current.srcObject = stream;
        setIsCameraOpen(true);
        videoRef.current.onloadedmetadata = (e) => {
          if (!canvasRef.current) return; // Exit if canvasRef.current is null

          canvasRef.current.width = e.target.videoWidth;
          canvasRef.current.height = e.target.videoHeight;
        };

        clearInterval(frameProcessingInterval);
        frameProcessingInterval = setInterval(processFrame, 1500);
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    } else {
      // Close the camera
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      setIsCameraOpen(false);
      setPrediction(null); // Clear the prediction when closing the camera
    }
  };

  const calculateFrameDifference = (frame1, frame2) => {
    let diff = 0;
    let countDifferingPixels = 0;

    for (let i = 0; i < frame1.data.length; i += 4) {
      const pixelDiff = Math.abs(frame1.data[i] - frame2.data[i]);
      diff += pixelDiff;

      if (pixelDiff > 20) {
        countDifferingPixels++;
      }
    }

    return { totalDifference: diff, differingPixels: countDifferingPixels };
  };

  const processFrame = () => {
    if (!canvasRef.current) return; // Exit if canvasRef.current is null

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);
    const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (prevFrameRef.current) {
      const { totalDifference, differingPixels } = calculateFrameDifference(
        prevFrameRef.current,
        currentFrame
      );

      const percentageDifference =
        (differingPixels / (canvas.width * canvas.height)) * 100;

      if (totalDifference > THRESHOLD && percentageDifference > 50) {
        handleCaptureImage(selectedBin);
      }
    }

    prevFrameRef.current = currentFrame;
  };

  const handleCaptureImage = async (currentBin) => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL("image/jpeg");
    const response = await uploadImage(dataURL);
    if (response && response.result) {
      setInstructionText(
        <div className="styles.predictionText">
          Prediction: {response.result.toUpperCase()}
        </div>
      );
      if (
        ["glass", "plastic", "paper", "cardboard", "metal"].includes(
          response.result.toLowerCase()
        )
      ) {
        incrementRecycledItem(currentBin);
      } else if (response.result.toLowerCase() === "compost") {
        incrementCompostItem(currentBin);
      } else if (response.result.toLowerCase() === "trash") {
        incrementTrashItem(currentBin);
      }
    } else {
      setInstructionText(
        "Place an item in front of the camera to watch the magic happen!"
      );
    }
  };

  return (
    <div className={styles.cameraContainer}>
      <div className={styles.cameraBorder}>
        <video ref={videoRef} autoPlay className={styles.cameraVideo}></video>
        <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
      </div>
      <p className={styles.predictionText}>{instructionText}</p>
    </div>
  );
};

export default CameraFeed;
