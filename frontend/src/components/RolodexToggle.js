import React, { useState } from 'react';
import './RolodexToggle.css';
import ImageList from './ImageList';
import DocumentsTable from './DocumentsTable';
import InventoryTable from './InventoryTable';

const RolodexToggle = ({ inventory, documents }) => {
  const [currentView, setCurrentView] = useState(0); // 0: Inventory, 1: Images, 2: Documents

  const views = [
    { name: 'Inventory', component: <InventoryTable inventory={inventory} /> },
    { name: 'Images', component: <ImageList inventory={inventory} /> },
    { name: 'Documents', component: <DocumentsTable documents={documents} /> },
  ];

  const handleNext = () => {
    setCurrentView((prev) => (prev + 1) % views.length);
  };

  const handlePrev = () => {
    setCurrentView((prev) => (prev - 1 + views.length) % views.length);
  };

  return (
    <div className="rolodex-container">
      <div className="rolodex-controls">
        <button className="prev-button" onClick={handlePrev}>
          ◀
        </button>
        <h2 className="rolodex-title">{views[currentView].name}</h2>
        <button className="next-button" onClick={handleNext}>
          ▶
        </button>
      </div>
      <div className="rolodex-view">
        <div
          className="rolodex-carousel"
          style={{
            transform: `rotateY(${currentView * -120}deg)`,
          }}
        >
          {views.map((view, index) => (
            <div
              className={`rolodex-item ${
                currentView === index ? 'active' : ''
              }`}
              key={index}
              style={{
                transform: `rotateY(${index * 120}deg) translateZ(300px)`,
              }}
            >
              {view.component}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RolodexToggle;