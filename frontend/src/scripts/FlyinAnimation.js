import React, { useEffect, useRef } from 'react';
import '../App.css';

const FlyItem = () => {
    const items = [
        { img: '../assets/buttons/BrassButton.png'},
        { text: 'wee woo wee woo wee woo'},
        { img: '../assets/icons/placeholder.png'}
    ];
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;

        items.forEach((item, index) => {
            const flyItem = document.createElement("div");
            flyItem.className = "fly-item";

            if (item.img) {
                // Create image
                const imgElement = document.createElement("img");
                imgElement.src = item.img;
                imgElement.alt = "Fly-in item";
                imgElement.className = "fly-item-img";
                flyItem.appendChild(imgElement);
            }

            if (item.text) {
                // Create text
                const textElement = document.createElement("p");
                textElement.textContent = item.text;
                textElement.className = "fly-item-text";
                flyItem.appendChild(textElement);
            }

            // Set initial position off-screen
            flyItem.style.left = `${Math.random() * window.innerWidth * 0.8}px`; // Limit left to 80% width
            flyItem.style.top = `${window.innerHeight + 150}px`; // Start below the viewport

            container.appendChild(flyItem);

            // Animate the fly-in effect
            setTimeout(() => {
                const finalY = Math.random() * (window.innerHeight * 0.5); // Top half of the screen
                flyItem.animate([
                    { transform: `translateY(-${window.innerHeight + 150 - finalY}px)` }
                ], {
                    duration: 5000,
                    easing: 'ease-in-out',
                    fill: 'forwards',
                });

                flyItem.style.top = `${finalY}px`;
            }, index * 800); // Staggered timing for each item
        });
    }, [items]);
  }

export default FlyItem;