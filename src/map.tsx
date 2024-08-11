import * as React from 'react';
import {createRef, useEffect, useState} from 'react';
import InteractiveMap, {GeolocateControl, MapMouseEvent, NavigationControl, useControl} from 'react-map-gl';
import {Layer} from "mapbox-gl";
import {DeckProps} from "@deck.gl/core";
import {MapboxOverlay} from "@deck.gl/mapbox";
import turfCentroid from '@turf/centroid';
import {featureCollection} from '@turf/helpers';
import {Feature, FeatureCollection, MultiPolygon, Point, Polygon} from 'geojson';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
    BuildingsLayer,
    CityBoundaryLayer,
    ElectionCommissionBoundaryLayer,
    ElectionCommissionLayer
} from './layers';
import useMapImage from "./image";
// import MapiClient from "@mapbox/mapbox-sdk/lib/classes/mapi-client";
import mbxDatasets from "@mapbox/mapbox-sdk/services/datasets";
import axios from 'axios';
import {ElectionCommissionBuilding, ElectionCommissionBuildingLayer} from "./deck-gl-layers";
import {ElectionCommissionControl} from "./controls/ElectionCommissionControl";


const accessToken = "pk.eyJ1Ijoia2xuNCIsImEiOiJjaW9sNjZlbWMwMDEwdzVtNmxxYjA2ZGozIn0.BytaphQwtjCVMGEaLlfb3Q";
const MapiClient = require('@mapbox/mapbox-sdk')
// const mapiClient = new MapiClient({accessToken})
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
const buildingSourceUrl = "mapbox://kln4.03j8zzhz"
const buildingSourceLayer = "krylatskoe2024_buildings-79ds1x"
const buildingDatasetId = 'clycqi0vyrak21tp8vcv2zixm';
const buildingDatasetUrl = `${process.env.PUBLIC_URL}/dataset/golyanovo2024_buildings.geojson`
const electionCommissionSourceUrl = "mapbox://kln4.44qt15d9"
const electionCommissionSourceLayer = "krylatskoe2024_uik-7pkv3s"
const electionCommissionDatasetId = 'clzoncuxn5sbe1tp11gcezkls';
const electionCommissionBoundarySourceUrl = "mapbox://kln4.3d10uul9"
const electionCommissionBoundarySourceLayer = "krylatskoe2024_boundary-80ocdy"
const electionCommissionBoundaryDatasetId = 'clzpanb3q196z1mmheh9gqerf';

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
    const [buildings, setBuildings] = useState(featureCollection([]));
    const [electionCommissions, setElectionCommissions] = useState(featureCollection([]));
    const [electionCommissionBuildings, setElectionCommissionBuildings] = useState([] as Array<ElectionCommissionBuilding>);
    const [electionCommissionBoundary, setElectionCommissionBoundary] = useState(featureCollection([]));
    const [clickedBuilding, setClickedBuilding] = useState(null);
    const [hoveredBuilding, setHoveredBuilding] = useState(null);
    const [clickedElectionCommission, setClickedElectionCommission] = useState(null);
    const [hoveredElectionCommission, setHoveredElectionCommission] = useState(null);
    const [visibilityElectionCommissionBoundary , setVisibilityElectionCommissionBoundary] = useState(false);

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
        axios.get<FeatureCollection<Polygon | MultiPolygon>>(buildingDatasetUrl)
            .then(
                response => {
                    let buildings: FeatureCollection<Polygon | MultiPolygon> = response.data
                    let buildingFeatures = buildings.features
                    let buildingCentroidFeatures = buildingFeatures
                        .map(feature => turfCentroid(feature))
                    setBuildings(buildings)
                },
                error => console.log(error)
            )
        datasetService
            .listFeatures({datasetId: electionCommissionDatasetId})
            .send()
            .then(
                response => {
                    let features: FeatureCollection<Point> = response.body
                    setElectionCommissions(features)
                },
                error => console.log(error)
            )
        datasetService
            .listFeatures({datasetId: electionCommissionBoundaryDatasetId})
            .send()
            .then(
                response => {
                    let features: FeatureCollection<Polygon | MultiPolygon> = response.body
                    setElectionCommissionBoundary(features)
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
            electionCommissionBuildings = buildings.features
                .filter(f => f?.properties?.uik_number === electionCommissionFeature?.properties?.uik)
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
                <BuildingsLayer featureCollection={buildings as FeatureCollection<Polygon | MultiPolygon>}
                                clicked={clickedBuilding}
                                hovered={hoveredBuilding}
                />
                <ElectionCommissionLayer featureCollection={electionCommissions as FeatureCollection<Point>}
                                         clicked={clickedElectionCommission}
                                         hovered={hoveredElectionCommission}
                />
                <ElectionCommissionBoundaryLayer
                    featureCollection={electionCommissionBoundary as FeatureCollection<Polygon | MultiPolygon>}
                    visibility={visibilityElectionCommissionBoundary}
                />
                <DeckGLOverlay
                    layers={[
                        new ElectionCommissionBuildingLayer(electionCommissionBuildings),
                    ]}
                />
            </InteractiveMap>
    )
}

