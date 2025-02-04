import React, { useState, useEffect, useContext } from 'react';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AuthContext from './contexts/AuthContext';
import InventoryTable from './components/InventoryTable';
import ImageList from './components/ImageList';
import ProcessImagesButton from './components/ProcessImagesButton';
import DocumentsTable from './components/DocumentsTable';
import RolodexToggle from './components/RolodexToggle';
import HowToUseOverlay from './components/HowToUseOverlay';
import LoginOverlay from './components/LoginOverlay';
import LoginAnimation from './scripts/LoginAnimation';
import UserMenu from './components/UserMenu';
import BlurbCarousel from './scripts/blurbcarousel';
import Navigation from './components/Navigation';
import Landing from './pages/Landing';
import Home from './pages/Home';
import About from './pages/About';
import Kaboodles from './pages/Kaboodles';
import Resources from './pages/Resources';
import Terms from './pages/Terms';
import config from './config';
import './App.css';

function App() {
    const { user, loading } = useContext(AuthContext);
    const [showRolodex, setShowRolodex] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const [activeTab, setActiveTab] = useState('inventory');
    const [inventory, setInventory] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [showHowTo, setShowHowTo] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            fetchData();
        }
        generateTiles();
    }, [user]);

    const generateTiles = () => {
        const container = document.querySelector('.background-container');
        if (container) {
            const totalTiles = Math.ceil(window.innerWidth / 100) * Math.ceil(window.innerHeight / 100);
            container.innerHTML = '';
            for (let i = 0; i < totalTiles; i++) {
                const tile = document.createElement('div');
                tile.classList.add('tile');
                container.appendChild(tile);
            }
        }
    };

    const fetchData = async () => {
        try {
            const response = await fetch(`${config.apiUrl}/api/inventory`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const data = await response.json();
                setInventory(Array.isArray(data) ? data : [data]);
            } else {
                console.log('No inventory data available');
            }
        } catch (error) {
            console.error('Error fetching inventory:', error);
        }

        try {
            const response = await fetch(`${config.apiUrl}/api/documents`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const data = await response.json();
                setDocuments(Array.isArray(data) ? data : [data]);
            } else {
                console.log('No documents data available');
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
        }
    };

    const handleProcessFiles = async () => {
        await fetchData();
        setShowRolodex(true);
        setIsExpanded(false);
        setActiveTab('inventory');
    };

    const handleResetInventory = async () => {
        if (window.confirm('Are you sure you want to reset the inventory?')) {
            try {
                await fetch(`${config.apiUrl}/api/inventory/reset`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                });
                await fetchData();
                alert('Inventory reset successful!');
            } catch (error) {
                console.error('Error resetting inventory:', error);
                setError('Failed to reset inventory.');
            }
        }
    };

    const handleResetDocuments = async () => {
        if (window.confirm('Are you sure you want to reset documents?')) {
            try {
                await fetch(`${config.apiUrl}/api/documents/reset`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                });
                await fetchData();
                alert('Documents reset successful!');
            } catch (error) {
                console.error('Error resetting documents:', error);
                setError('Failed to reset documents.');
            }
        }
    };

    if (loading) {
        return (
            <div className="loading-container neo-decoroco-panel">
                <div className="loading-spinner"></div>
                <div className="loading-text">Loading...</div>
            </div>
        );
    }

    return (
        <div className="app-container">
            <Navigation />
            <header className="app-header">
                {user && <UserMenu user={user} />}
            </header>

            <main className="main-section">
                {error && <div className="error-message neo-decoroco-panel">{error}</div>}

                <LoginAnimation isVisible={!user}>
                    <LoginOverlay isVisible={!user} />
                </LoginAnimation>

                {user && (
                    <>
                        <div className={`upload-section neo-decoroco-panel ${!showRolodex ? 'expanded' : 'minimized'}`}>
                            <ProcessImagesButton onProcess={handleProcessFiles} isAuthenticated={true} />
                        </div>

                        {showRolodex && (
                            <div className="content-display-wrapper">
                                <RolodexToggle inventory={inventory} documents={documents} />
                            </div>
                        )}
                    </>
                )}
            </main>

            <HowToUseOverlay isOpen={showHowTo} onClose={() => setShowHowTo(false)} />
            <SpeedInsights />
        </div>
    );
}

// Wrap the app with necessary providers
function AppWrapper() {
    return (
        <GoogleOAuthProvider clientId={config.googleClientId}>
            <Router>
                <App />
            </Router>
        </GoogleOAuthProvider>
    );
}

export default AppWrapper;
