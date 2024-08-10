import React, {useState} from 'react';
import './App.css';
import Map from './map';
import Toolbar from './toolbar';
import {Feature} from "geojson";
import {Layer} from "mapbox-gl";

export default function App() {
    const [feature, setFeature] = useState(null as Feature & { layer: Layer } | null);
    let handleClick = (feature: Feature & { layer: Layer }) => setFeature(feature)
    const style = {
        backgroundColor: '#D7DADB',
        height: '100%',
    }
    return (
        <div style={style}>
            <Map onClick={handleClick}/>
            <Toolbar feature={feature}/>
        </div>
    )
}
