import React, { useState, useEffect } from "react";
import "./styles/blurb.css";
import clickandone from "../assets/clickandone.png";
import yippeekiAI from "../assets/yippeekiAI.png"; 
import adequate from "../assets/adequate.png";

const blurbs = [
  { id: 1, type: "text", text: "Flawless filing filed in a fast" },
  { id: 2, type: "quote", text: "Carefully crafted colorful content catalogued cleanly." },
  { id: 3, type: "image", img: adequate },
  { id: 4, type: "text", text: "Ok quality with an average attitude." },
  { id: 5, type: "tip", text: "Condense dense documents into nicely concise summaries." },
  { id: 6, type: "quote", text: "an all-around acceptable performance" },
  { id: 7, type: "image", img: yippeekiAI },
  { id: 8, type: "text", text: "Click and one, done!" },
  { id: 9, type: "image", img: clickandone },
];

const BlurbCarousel = () => {
  const [currentBlurbIndex, setCurrentBlurbIndex] = useState(0);
  const [animationClass, setAnimationClass] = useState("fly-in-right");

  useEffect(() => {
    const interval = setInterval(() => {
      handleNextBlurb();
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [currentBlurbIndex]);

  const handleNextBlurb = () => {
    setAnimationClass("fly-out-left");
    setTimeout(() => {
      setCurrentBlurbIndex((prevIndex) => (prevIndex + 1) % blurbs.length);
      setAnimationClass("fly-in-right");
    }, 1000); // Match the CSS transition duration
  };

  return (
    <div className="blurb-container">
      {blurbs.map((blurb, index) => (
        <div
          key={blurb.id}
          className={`blurb ${index === currentBlurbIndex ? animationClass : ""} ${blurb.type}`}
        >
          {blurb.type === "text" && <p>{blurb.text}</p>}
          {blurb.type === "quote" && <blockquote>{blurb.text}</blockquote>}
          {blurb.type === "tip" && (
            <div className="tip">
              <span className="tip-label">TIP:</span> {blurb.text}
            </div>
          )}
          {blurb.type === "image" && <img src={blurb.img} alt="Blurb visual" />}
        </div>
      ))}  
    </div>
  );
};

export default BlurbCarousel;
