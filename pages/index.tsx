import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import { drawEmoji } from "../utils/drawEmoji";
import Loader from "../components/Loader";

export default function Home() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const loadModels = async () => {
    const MODEL_URL = `/models`;
    await Promise.all([
      faceapi.nets.tinyFaceDetector.load(MODEL_URL),
      faceapi.nets.faceExpressionNet.load(MODEL_URL),
    ]);
  };

  const handleLoadWaiting = async () => {
    return new Promise((resolve) => {
      const timer = setInterval(() => {
        if (webcamRef.current?.video?.readyState == 4) {
          resolve(true);
          clearInterval(timer);
        }
      }, 500);
    });
  };

  const faceDetectHandler = async () => {
    await loadModels();
    await handleLoadWaiting();
    if (webcamRef.current && canvasRef.current) {
      setIsLoaded(true);
      const webcam = webcamRef.current.video as HTMLVideoElement;
      const canvas = canvasRef.current;
      webcam.width = webcam.videoWidth;
      webcam.height = webcam.videoHeight;
      canvas.width = webcam.videoWidth;
      canvas.height = webcam.videoHeight;
      const video = webcamRef.current.video;
      (async function draw() {
        const detectionsWithExpressions = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions();
        if (detectionsWithExpressions.length > 0) {
          drawEmoji(detectionsWithExpressions, canvasRef.current);
        }
        requestAnimationFrame(draw);
      })();
    }
  };

  useEffect(() => {
    faceDetectHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className={styles.container}>
        <Head>
          <title>Face2Emoji</title>
          <meta name="description" content="Mask Emoji to your face" />
          <meta property="og:image" key="ogImage" content="/emojis/happy.png" />
          <link rel="icon" href="/emojis/happy.png" />
        </Head>
        <header className={styles.header}>
          <h1 className={styles.title}>Face2Emoji</h1>
        </header>
        <main className={styles.main}>
          <Webcam audio={false} ref={webcamRef} className={styles.video} />
          <canvas ref={canvasRef} className={styles.video} />
        </main>
      </div>
      {!isLoaded && <Loader />}
    </>
  );
}
