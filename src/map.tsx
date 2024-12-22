import * as React from 'react';
import {createRef, useEffect, useState} from 'react';
import InteractiveMap, {GeolocateControl, MapMouseEvent, NavigationControl, useControl} from 'react-map-gl';
import {Layer} from "mapbox-gl";
import {DeckProps} from "@deck.gl/core";
import {MapboxOverlay} from "@deck.gl/mapbox";
import {featureCollection} from '@turf/helpers';
import {Feature, FeatureCollection, MultiPolygon, Polygon} from 'geojson';
import 'mapbox-gl/dist/mapbox-gl.css';
import {BuildingsLayer, CityBoundaryLayer, ElectionCommissionLayer} from './layers';
import useMapImage from "./image";
import mbxDatasets from "@mapbox/mapbox-sdk/services/datasets";
import {ElectionCommissionBuilding, ElectionCommissionBuildingLayer} from "./deck-gl-layers";
import {ElectionCommissionControl} from "./controls/ElectionCommissionControl";


const accessToken = "pk.eyJ1Ijoia2xuNCIsImEiOiJjaW9sNjZlbWMwMDEwdzVtNmxxYjA2ZGozIn0.BytaphQwtjCVMGEaLlfb3Q";
const MapiClient = require('@mapbox/mapbox-sdk')
const mapiClient = new MapiClient({accessToken})
const datasetService = mbxDatasets(mapiClient);

const mapProperties = {
    longitude: 37.8050,
    latitude: 55.8104,
    zoom: 12.5,
    pitch: 50,
    bearing: 260
}

const styleId = 'cl65cx61a000c15ljmv271d6d';

const boundaryDatasetId = 'clzmpz9gw0ngb1ul9kk3pwc20';
// const boundarySourceUrl = 'mapbox://kln4.2mjwnfsi';
// const boundarySourceLayer = 'golyanovo2024_boundary-96tlc2';
const buildingSourceUrl = "mapbox://kln4.cgpxhsx8"
const buildingSourceLayer = "golyanovo2024_buildings-ah3il0"
const electionCommissionSourceUrl = "mapbox://kln4.golyanovo2024_uik"
const electionCommissionSourceLayer = "golyanovo2024_uik"
const electionCommissionBoundarySourceLayer = "golyanovo2024_uik_boundary"
const electionCommissionBoundaryCentroidsSourceLayer = "golyanovo2024_uik_boundary"

function DeckGLOverlay(props: DeckProps) {
    const overlay = useControl<any>(() => new MapboxOverlay(props));
    overlay.setProps(props);
    return null;
}

export interface MapProps {
    onClick: (feature: Feature & { layer: Layer }) => void;
}

export default function Map(props: MapProps) {
    const [boundary, setBoundary] = useState(featureCollection([]));
    const [electionCommissionBuildings, setElectionCommissionBuildings] = useState([] as Array<ElectionCommissionBuilding>);
    const [clickedBuilding, setClickedBuilding] = useState(null);
    const [hoveredBuilding, setHoveredBuilding] = useState(null);
    const [clickedElectionCommission, setClickedElectionCommission] = useState(null);
    const [hoveredElectionCommission, setHoveredElectionCommission] = useState(null);
    const [visibilityElectionCommissionBoundary , setVisibilityElectionCommissionBoundary] = useState(true);

    useEffect(() => {
        datasetService
            .listFeatures({datasetId: boundaryDatasetId})
            .send()
            .then(
                response => {
                    let features: FeatureCollection<Polygon | MultiPolygon> = response.body
                    setBoundary(features)
                },
                error => console.log(error)
            )
    }, []);

    const mapRef = createRef();
    useMapImage({mapRef, name: 'star', url: `${process.env.PUBLIC_URL}/img/star.png`})
    useMapImage({mapRef, name: 'star-stroked', url: `${process.env.PUBLIC_URL}/img/star-stroked.png`})

    let handleEnter = (event: MapMouseEvent) => {
        let buildingFeature = event?.features?.find(f => f.layer.id === 'buildings') || null
        let electionCommissionFeature = event?.features?.find(f => f.layer.id === 'electionCommissions') || null
        setHoveredBuilding(buildingFeature)
        setHoveredElectionCommission(electionCommissionFeature)
    }

    let handleLeave = () => {
        setHoveredBuilding(null)
        setHoveredElectionCommission(null)
    }

    let handleClick = (event: MapMouseEvent) => {
        let buildingFeature = event?.features?.find(f => f.layer.id === 'buildings') || null
        let electionCommissionFeature = event?.features?.find(f => f.layer.id === 'electionCommissions') || null
        let electionCommissionBuildings: Array<ElectionCommissionBuilding> = []
        if (buildingFeature) {
            electionCommissionBuildings = [new ElectionCommissionBuilding(buildingFeature)]
        } else if (electionCommissionFeature) {
            electionCommissionBuildings = event.target
                .querySourceFeatures("buildingsSource", {
                    sourceLayer: buildingSourceLayer,
                    filter: ['==', ['get', 'uik'], electionCommissionFeature?.properties?.uik]
                })
                .map(f => new ElectionCommissionBuilding(f))
        }
        props.onClick(buildingFeature || electionCommissionFeature)
        setClickedBuilding(buildingFeature)
        setClickedElectionCommission(electionCommissionFeature)
        setElectionCommissionBuildings(electionCommissionBuildings)
        setHoveredBuilding(null)
        setHoveredElectionCommission(null)
    }

    let handleUikControlClick =
        () => setVisibilityElectionCommissionBoundary((prev) => !prev)

    return (
            <InteractiveMap
                mapboxAccessToken={accessToken}
                style={{
                    position: 'absolute',
                    height: '100%',
                    width: '100%'
                }}
                initialViewState={mapProperties}
                mapStyle={`mapbox://styles/kln4/${styleId}`}
                interactiveLayerIds={["buildings", "electionCommissions"]}
                onClick={handleClick}
                onMouseEnter={handleEnter}
                onMouseLeave={handleLeave}
                ref={mapRef as any}
            >
                <NavigationControl/>
                <GeolocateControl/>
                <ElectionCommissionControl
                    position="top-left"
                    selected={visibilityElectionCommissionBoundary}
                    onCLick={handleUikControlClick}
                />
                <CityBoundaryLayer featureCollection={boundary as FeatureCollection<Polygon | MultiPolygon>}/>
                <BuildingsLayer url={buildingSourceUrl} sourceLayer={buildingSourceLayer}
                                clicked={clickedBuilding}
                                hovered={hoveredBuilding}
                />
                <ElectionCommissionLayer url={electionCommissionSourceUrl}
                                         sourceLayer={electionCommissionSourceLayer}
                                         boundarySourceLayer={electionCommissionBoundarySourceLayer}
                                         boundaryCentroidSourceLayer={electionCommissionBoundaryCentroidsSourceLayer}
                                         clicked={clickedElectionCommission}
                                         hovered={hoveredElectionCommission}
                                         boundaryVisibility={visibilityElectionCommissionBoundary}
                />
                <DeckGLOverlay
                    layers={[
                        new ElectionCommissionBuildingLayer(electionCommissionBuildings),
                    ]}
                />
            </InteractiveMap>
    )
}

