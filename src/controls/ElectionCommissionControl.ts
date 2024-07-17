import {ControlPosition, MapboxMap} from "react-map-gl";
import {Map, IControl} from "mapbox-gl"
import {useControl} from 'react-map-gl';
import './ElectionCommissionControl.css';

type ElectionCommissionControlProps = {
    position?: ControlPosition
    selected: boolean
    onCLick: () => void
}

export function ElectionCommissionControl(props: ElectionCommissionControlProps) {
    useControl(
        // @ts-ignore
        () => new ElectionCommissionButton(props),
        {
            position: props.position
        }
    );
    return null
}

type Config = {
    position: ControlPosition
    selected: boolean
    onCLick: () => void
};

class ElectionCommissionButton implements IControl {
    _map: MapboxMap | null = null
    _container: HTMLElement | null = null
    _position: ControlPosition = 'top-left'
    _selected: boolean = false
    _onCLick: () => void = () => {
    }

    constructor({position, selected, onCLick}: Config) {
        this._position = position
        this._selected = selected
        this._onCLick = onCLick
    }

    onAdd(map: Map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
        const button = document.createElement('button')
        let classNameSuffix = this._selected ? '-selected' : ''
        button.className = `mapboxgl-ctrl-election-commission${classNameSuffix}`
        button.type = 'button'
        button.ariaLabel = 'Зона УИК'
        button.ariaDisabled = "false"
        const span = document.createElement('span')
        span.className = "mapboxgl-ctrl-icon"
        span.ariaHidden = "true"
        span.title = "Зона УИК"
        button.appendChild(span)
        button.onclick = this._onCLick
        this._container.appendChild(button)
        return this._container;
    }

    onRemove() {
        if (this._map === null || this._container === null) return;
        this._container.remove();
        this._map = null;
    }
}