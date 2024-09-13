import * as React from 'react';
import {Feature} from "geojson";
import {Layer} from "mapbox-gl";

export interface ToolbarProps {
    feature: Feature & { layer: Layer } | null
}

export default function Toolbar(props: ToolbarProps) {
    const style = {
        position: 'absolute' as 'absolute',
        left: '5px',
        right: '5px',
        bottom: '5px',
        height: '110px',
        backgroundColor: 'white',
        borderRadius: '10px',
        opacity: 0.9,
        textAlign: 'center' as const,
        padding: '15px'
    };

    let title
    let content
    if (props.feature?.layer.id === "buildings") {
        const uik = props?.feature?.properties?.['uik'] || "";
        const flats = props?.feature?.properties?.['building:flats'] || "";
        const halls = props?.feature?.properties?.['building:halls'] || "";
        title = props?.feature?.properties?.['address'] || "";
        content = (
            <React.Fragment>
                <b>УИК:</b> <span>№ {uik}</span> <br/>
                {/*<b>Жителей:</b> {props.properties != null ? <span>{props.properties['address:residents']}</span> : ""}<br/>*/}
                <b>Квартир:</b> <span>{flats}</span> <br/>
                {/*<b>Подъездов:</b> <span>{halls}</span><br/>*/}
            </React.Fragment>
        )
    } else if (props.feature?.layer.id === "electionCommissions") {
        const description = props?.feature?.properties?.['description'] || "";
        const address = props?.feature?.properties?.['address'] || "";
        const phone = props?.feature?.properties?.['phone'] || "";
        const result = props?.feature?.properties?.['result'] || "";
        title = props?.feature?.properties?.['name'] || "";
        content = (
            <React.Fragment>
                <b>Учреждение:</b> <span>{description}</span> <br/>
                <b>Адрес:</b> <span>{address}</span> <br/>
                <b>Телефон:</b> <span>{phone}</span><br/>
                <b>Результат:</b> <span>{result}</span><br/>
            </React.Fragment>
        )
    }

    // const contacts = props.properties != null ?
    //     JSON.parse(props.properties.contacts != 'null' ? props.properties.contacts : '[]')
    //         .map((val: any, index: any) => {
    //             let fio = val['fio']
    //             let apartment = val['apartment']
    //             return <span key={index}>{fio} - {apartment}<br/></span>
    //         }) : <span/>

    return (
        <div style={style}>
            <table style={{width: '100%', height: '100%', display: 'flex', flexFlow: 'column'}}>
                <thead>
                <tr>
                    <th colSpan={2}>
                        <h4 style={{margin: '0px'}}>
                            {title}
                        </h4>
                    </th>
                </tr>
                </thead>
                <tbody style={{flex: '1 1 auto', display: 'block', overflowY: 'scroll'}}>
                <tr style={{textAlign: "left" as const}}>
                    <td style={{padding: "5px", verticalAlign: "top" as const}}>
                        {content}
                    </td>
                    <td style={{padding: "5px", verticalAlign: "top" as const}}>
                        {/*<b>Контакты:</b><br/>*/}
                        {/*<span>{contacts}</span>*/}
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    )
}