import * as React from 'react';
import {Layer, Source} from 'react-map-gl';
import turfBboxPolygon from '@turf/bbox-polygon';
import turfDifference from '@turf/difference';
import turfCenterOfMass from '@turf/center-of-mass';
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
    featureCollection: FeatureCollection<Polygon | MultiPolygon>;
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
    let buildingStyle: any = {...style, ...{id: 'buildings'}, ...{paint: {...style.paint, ...{'fill-extrusion-opacity': 0.5}}}}
    let clickedStyle: any = {...style, ...{id: 'clickedBuildings'}, ...{paint: {...style.paint, ...{'fill-extrusion-opacity': 1}}}}
    let hoveredStyle: any = {...style, ...{id: 'hoveredBuildings'}, ...{paint: {...style.paint, ...{'fill-extrusion-opacity': 0.8}}}}
    return (
        <React.Fragment>
            <Source id="buildingsSource" type="geojson" data={props.featureCollection}>
                <Layer {...buildingStyle} />
                <Layer {...clickedStyle} filter={['==', 'id', clickedId]}/>
                <Layer {...hoveredStyle} filter={['==', 'id', hoverId]}/>
            </Source>
        </React.Fragment>
    )
}

export interface ElectionCommissionLayerProps {
    featureCollection: FeatureCollection<Point>;
    clicked: Feature<Point> | null;
    hovered: Feature<Point> | null;
}

export function ElectionCommissionLayer(props: ElectionCommissionLayerProps) {
    let clickedId = props?.clicked?.properties?.id || 0
    let hoverId = props?.hovered?.properties?.id || 0
    let symbolStyle: SymbolLayerSpecification = {
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
    return (
        <React.Fragment>
            <Source id="electionCommissionSource" type="geojson" data={props.featureCollection}>
                <Layer {...symbolStyle} />
            </Source>
        </React.Fragment>
    )
}

export interface ElectionCommissionBoundaryLayerProps {
    featureCollection: FeatureCollection<Polygon | MultiPolygon>
    visibility: boolean
}

export function ElectionCommissionBoundaryLayer(props: ElectionCommissionBoundaryLayerProps) {
    const visibility = props.visibility ? "visible" : "none"
    const style: FillLayerSpecification = {
        id: 'electionCommissionBoundary',
        source: "electionCommissionBoundarySource",
        type: "fill",
        layout: {
            "visibility": visibility,
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
    return (
        <Source id="electionCommissionBoundarySource" type="geojson" data={props.featureCollection}>
            <Layer {...style} />
        </Source>
    )
}

export interface ElectionCommissionCentroidLayerProps {
    featureCollection: FeatureCollection<Polygon | MultiPolygon>
}

export function ElectionCommissionCentroidLayer(props: ElectionCommissionCentroidLayerProps) {
    const centroidsFeatures = props.featureCollection.features
        .map(f => turfCenterOfMass(f, {properties: {...f.properties, title: f.properties?.uik + "\n" + f.properties?.result}}))
    const centroids = featureCollection(centroidsFeatures)
    const style: SymbolLayerSpecification = {
        id: 'electionCommissionCentroid',
        source: "electionCommissionCentroidSource",
        type: "symbol",
        layout: {
            'text-field': {
                'property': 'title',
                'type': 'identity'
            },
            'text-font': [
                'literal',
                ['Arial Unicode MS Bold']
            ],

            'text-size': ['interpolate', ['linear'], ['zoom'], 10, 8, 20, 28],
        },
        paint: {
            'text-color':  '#2f4f4f'
        }
    }
    return (
        <Source id="electionCommissionCentroidSource" type="geojson" data={centroids}>
            <Layer {...style} />
        </Source>
    )
}


// export interface BuildingCentroidsLayerProps {
//     features: Feature<GeometryObject>[];
//     symbol?: boolean;
//     circle?: boolean;
// }
//
// function BuildingCentroidsLayer(props: BuildingCentroidsLayerProps) {
//     let symbolLayout = props.symbol ? {
//         'text-field': {
//             'property': 'contacts_count',
//             'type': 'identity'
//         },
//         'text-font': [
//             'literal',
//             ['Arial Unicode MS Bold']
//         ],
//         'text-size': 10
//     } : null
//     let symbolPaint = props.symbol ? {
//         'text-color': ['case', ['==', ['get', 'contacts_count'], 0], 'red', 'black']
//     } : null
//     let circlePaint = props.circle ? {
//         'circle-color': "#FFFFFF",
//         'circle-radius': 7,
//         'circle-stroke-color': "black",
//         'circle-stroke-width': 0.5,
//     } : null
//
//     return (<GeoJSONLayer
//         data={{
//             'type': 'FeatureCollection',
//             'features': props.features
//         }}
//         symbolLayout={symbolLayout}
//         symbolPaint={symbolPaint}
//         circlePaint={circlePaint}
//     />);
// }
