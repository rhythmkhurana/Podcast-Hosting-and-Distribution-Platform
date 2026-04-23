import React, { useEffect, useRef } from 'react';
import usePlayerStore from '../../store/playerStore';

const WaveformVisualizer = () => {
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const { isPlaying } = usePlayerStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();

    const numBars = 40;

    const render = () => {
      requestRef.current = requestAnimationFrame(render);

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      const time = Date.now() / 300;
      const barW = (width / numBars) * 0.6;
      const gap = (width / numBars) * 0.4;

      for (let i = 0; i < numBars; i++) {
        const x = i * (barW + gap);

        let barHeight;
        if (isPlaying) {
          // Lively animated bars when playing
          barHeight = height * 0.1 + (Math.sin(time + i * 0.5) + 1) * height * 0.38 + Math.random() * height * 0.04;
        } else {
          // Gentle idle pulse when paused
          barHeight = height * 0.08 + (Math.sin(time * 0.4 + i * 0.6) + 1) * height * 0.06;
        }

        const alpha = isPlaying ? 0.85 : 0.3;
        ctx.fillStyle = isPlaying
          ? `rgba(245, 166, 35, ${alpha})`
          : `rgba(120, 120, 120, ${alpha})`;

        ctx.beginPath();
        ctx.roundRect(x, height - barHeight, barW, barHeight, [2, 2, 0, 0]);
        ctx.fill();
      }
    };

    render();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(requestRef.current);
      ro.disconnect();
    };
  }, [isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-12"
      style={{ display: 'block' }}
    />
  );
};

export default WaveformVisualizer;
