import React from 'react'
import { useModelOptions } from '../customHooks';
import { useParams } from 'react-router-dom';
import GenericDetailView from '../components/GenericDetailView';
import { useQuery } from '@tanstack/react-query';

const MODELNAME = 'location';

const LocationDetailView = props => {

    const locationParams = useParams();
    const modelOptions = useModelOptions(MODELNAME);

    const obj = useQuery({
        queryKey: [MODELNAME, locationParams.id]
    })

    return (
        <GenericDetailView
            {...props}
            model={MODELNAME}
            detailFormLayout={[
                ['id', null],
                ['name'],
                ['address_line_1'],
                ['address_line_2'],
                ['city'],
                ['state', 'zipcode'],
                ['country'],
                ['longitude'],
                ['latitude']
            ]}
        >

            {/* Model/Page specific content can be added here */}

        </GenericDetailView>
    )
}

export default LocationDetailView