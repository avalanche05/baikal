import React, { useState } from 'react';
import { RadarVisualization } from './components/RadarVisualization';
import { Radar } from './models/radar';
import './App.css';

function App() {
    const [radarData, setRadarData] = useState<Radar | null>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string) as Radar;
                setRadarData(data);
            } catch (error) {
                console.error('Ошибка при чтении файла:', error);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className='app'>
            <h1>Визуализация данных радара</h1>
            <div className='file-upload'>
                <input type='file' accept='.json' onChange={handleFileUpload} />
            </div>
            {radarData && <RadarVisualization radarData={radarData} />}
        </div>
    );
}

export default App;
