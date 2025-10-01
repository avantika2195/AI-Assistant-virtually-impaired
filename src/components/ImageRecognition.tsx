import React, { useRef, useCallback, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';
import { Camera, Eye, Volume2, VolumeX } from 'lucide-react'; // Fixed import

interface Detection {
  class: string;
  score: number;
  bbox: [number, number, number, number];
}

export default function ImageRecognition() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<cocossd.ObjectDetection | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        const loadedModel = await cocossd.load({ base: 'mobilenet_v2' });
        setModel(loadedModel);
        speak('Vision system ready. You can say "detect" or "describe" to analyze your surroundings.');
      } catch (error) {
        console.error('Error loading model:', error);
        speak('Failed to initialize vision system. Please refresh the page.');
      }
    };
    loadModel();
  }, []);

  const speak = (text: string) => {
    if (!isMuted) {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const drawDetections = (detections: Detection[]) => {
    if (!canvasRef.current || !webcamRef.current?.video) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const video = webcamRef.current.video;
    canvasRef.current.width = video.videoWidth;
    canvasRef.current.height = video.videoHeight;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    detections.forEach(detection => {
      const [x, y, width, height] = detection.bbox;

      ctx.strokeStyle = '#9333ea';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      ctx.fillStyle = '#9333ea';
      const label = `${detection.class} ${(detection.score * 100).toFixed(0)}%`;
      const labelWidth = ctx.measureText(label).width;
      ctx.fillRect(x, y - 25, labelWidth + 10, 25);

      ctx.fillStyle = '#ffffff';
      ctx.font = '16px Arial';
      ctx.fillText(label, x + 5, y - 7);
    });
  };

  const detectObjects = useCallback(async (detailed: boolean = false) => {
    if (!webcamRef.current?.video || !model || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      const predictions = await model.detect(webcamRef.current.video);
      setDetections(predictions);
      drawDetections(predictions);

      if (predictions.length === 0) {
        speak('No objects detected in view');
      } else {
        const description = predictions
          .map(pred => `${pred.class} with ${Math.round(pred.score * 100)}% confidence`)
          .join(', ');

        if (detailed) {
          const spatialDesc = predictions.map(pred => {
            const [x, y] = pred.bbox;
            const position =
              x < webcamRef.current!.video!.videoWidth / 3
                ? 'on the left'
                : x > (webcamRef.current!.video!.videoWidth * 2) / 3
                ? 'on the right'
                : 'in the center';
            return `${pred.class} ${position}`;
          }).join(', ');
          speak(`Detailed view: ${spatialDesc}`);
        } else {
          speak(`I see ${description}`);
        }
      }
    } catch (error) {
      console.error('Detection error:', error);
      speak('Sorry, there was an error processing the image');
    } finally {
      setIsAnalyzing(false);
    }
  }, [model, isAnalyzing]);

  useEffect(() => {
    let animationFrame: number;

    const detectLoop = async () => {
      if (isLive) {
        await detectObjects(false);
        animationFrame = requestAnimationFrame(detectLoop);
      }
    };

    if (isLive) detectLoop();

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isLive, detectObjects]);

  useEffect(() => {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      if (transcript.includes('detect')) detectObjects(false);
      else if (transcript.includes('describe')) detectObjects(true);
      else if (transcript.includes('live')) {
        setIsLive(prev => !prev);
        speak(isLive ? 'Stopping live detection' : 'Starting live detection');
      }
    };
    recognition.start();
    return () => recognition.stop();
  }, [detectObjects, isLive]);

  return (
    <div className="space-y-4">
      <div className="relative rounded-lg overflow-hidden">
        <Webcam
          ref={webcamRef}
          className="w-full h-[400px] object-cover"
          screenshotFormat="image/jpeg"
          videoConstraints={{
            facingMode: 'environment',
            width: 640,
            height: 480
          }}
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
        />

        <div className="absolute bottom-4 right-4 flex space-x-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="bg-purple-600 text-white p-3 rounded-full hover:bg-purple-700 transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>
          <button
            onClick={() => detectObjects(true)}
            disabled={isAnalyzing}
            className="bg-purple-600 text-white p-3 rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50"
            title="Detailed description"
          >
            <Eye className="w-6 h-6" />
          </button>
          <button
            onClick={() => detectObjects(false)}
            disabled={isAnalyzing}
            className="bg-purple-600 text-white p-3 rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50"
            title="Quick detection"
          >
            <Camera className="w-6 h-6" />
          </button>
        </div>

        {isAnalyzing && (
          <div className="absolute top-4 left-4 bg-purple-600 text-white px-4 py-2 rounded-lg">
            <p className="animate-pulse">Analyzing...</p>
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-800 mb-2">Detection Results</h3>
        {detections.length > 0 ? (
          <ul className="space-y-2">
            {detections.map((det, idx) => (
              <li key={idx} className="flex items-center justify-between">
                <span className="text-gray-700">{det.class}</span>
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                  {(det.score * 100).toFixed(0)}%
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No objects detected</p>
        )}
      </div>
    </div>
  )
};

