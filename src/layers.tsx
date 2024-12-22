import * as React from 'react';
import {Layer, Source} from 'react-map-gl';
import turfBboxPolygon from '@turf/bbox-polygon';
import turfDifference from '@turf/difference';
import {featureCollection} from '@turf/helpers';
import {Feature, FeatureCollection, MultiPolygon, Point, Polygon} from 'geojson';
import {
    SymbolLayerSpecification,
    FillExtrusionLayerSpecification,
    FillLayerSpecification,
} from "mapbox-gl";

export interface CityBoundaryLayerProps {
    featureCollection: FeatureCollection<Polygon | MultiPolygon>;
}

export function CityBoundaryLayer(props: CityBoundaryLayerProps) {
    let boundary = null
    if (props.featureCollection.features[0]) {
        let feature = props.featureCollection.features[0] || {}
        let bounds = turfBboxPolygon([180, 90, -180, -90])
        let features = featureCollection([bounds, feature])
        boundary = turfDifference(features)
    }

    const style: FillLayerSpecification = {
        id: 'boundary',
        source: "boundarySource",
        type: "fill",
        paint: {
            "fill-color": "grey",
            "fill-opacity": 0.8,
            "fill-outline-color": "red",
        }
    };
    return (
        <Source id="boundarySource" type="geojson" data={boundary}>
            <Layer {...style} />
        </Source>
    )
}

export interface BuildingsLayerProps {
    url: string
    sourceLayer: string
    clicked: Feature<Polygon | MultiPolygon> | null;
    hovered: Feature<Polygon | MultiPolygon> | null;
}

export function BuildingsLayer(props: BuildingsLayerProps) {
    let clickedId = props?.clicked?.properties?.id || 0
    let hoverId = props?.hovered?.properties?.id || 0
    const style: Partial<FillExtrusionLayerSpecification> = {
        source: "buildingsSource",
        type: "fill-extrusion",
        paint: {
            "fill-extrusion-color": {
                'property': 'color',
                'type': 'identity'
            },
            'fill-extrusion-height': {
                'property': 'building:level',
                'type': 'identity'
            },
            'fill-extrusion-base': {
                'property': 'base_height',
                'type': 'identity'
            },
        }
    }
    let buildingStyle: any = {...style, ...{paint: {...style.paint, ...{'fill-extrusion-opacity': 0.5}}}}
    let clickedStyle: any = {...style, ...{paint: {...style.paint, ...{'fill-extrusion-opacity': 1}}}}
    let hoveredStyle: any = {...style, ...{paint: {...style.paint, ...{'fill-extrusion-opacity': 0.8}}}}
    return (
        <React.Fragment>
            <Source id="buildingsSource" type="vector" url={props.url}>
                <Layer id={'buildings'} source-layer={props.sourceLayer} {...buildingStyle}/>
                <Layer id={'clickedBuildings'} source-layer={props.sourceLayer} {...clickedStyle} filter={['==', 'id', clickedId]}/>
                <Layer id={'hoveredBuildings'} source-layer={props.sourceLayer} {...hoveredStyle} filter={['==', 'id', hoverId]}/>
            </Source>
        </React.Fragment>
    )
}

export interface ElectionCommissionLayerProps {
    url: string
    sourceLayer: string
    boundarySourceLayer: string
    boundaryCentroidSourceLayer: string
    clicked: Feature<Point> | null;
    hovered: Feature<Point> | null;
    boundaryVisibility: boolean
}

export function ElectionCommissionLayer(props: ElectionCommissionLayerProps) {
    const clickedId = props?.clicked?.properties?.id || 0
    const hoverId = props?.hovered?.properties?.id || 0
    const boundaryVisibility = props.boundaryVisibility ? "visible" : "none"
    let electionCommissionStyle: SymbolLayerSpecification = {
        id: 'electionCommissions',
        source: "electionCommissionSource",
        type: "symbol",
        layout: {
            "icon-image": "star",
            "icon-size": ['interpolate', ['linear'], ['zoom'], 10, 0.1, 15, 0.7],
        },
        paint: {
            "icon-color": {
                'property': 'color',
                'type': 'identity'
            },
            "icon-opacity": [
                "case",
                ['==', ['get', 'id'], clickedId], 1,
                ['==', ['get', 'id'], hoverId], 0.8,
                0.5
            ],
        }
    }
    const electionCommissionBoundaryStyle: FillLayerSpecification = {
        id: 'electionCommissionBoundary',
        source: "electionCommissionBoundarySource",
        type: "fill",
        layout: {
            "visibility": boundaryVisibility,
        },
        paint: {
            "fill-color": {
                'property': 'result',
                'stops': [[0, "#ffffff"], [0.3, "#ff0000"]],
            },
            "fill-opacity": 0.7,
            "fill-outline-color": "red",
        },
    };
    const electionCommissionBoundaryCentroidStyle: SymbolLayerSpecification = {
        id: 'electionCommissionCentroid',
        source: "electionCommissionCentroidSource",
        type: "symbol",
        layout: {
            'text-field': ["concat", ["get", "uik"], "\n", [ "/", ["round", ["*", ["get", "result"], 1000]], 10], "%"],
            'text-font': [
                'literal',
                ['Arial Unicode MS Bold']
            ],

            'text-size': ['interpolate', ['linear'], ['zoom'], 10, 8, 20, 28],
        },
        paint: {
            'text-color':  '#2f4f4f'
        }
    };
    return (
        <React.Fragment>
            <Source id="electionCommissionSource" type="vector" url={props.url}>
                <Layer source-layer={props.sourceLayer} {...electionCommissionStyle} />
                <Layer source-layer={props.boundarySourceLayer} {...electionCommissionBoundaryStyle} />
                <Layer source-layer={props.boundaryCentroidSourceLayer} {...electionCommissionBoundaryCentroidStyle} />
            </Source>
        </React.Fragment>
    )
}