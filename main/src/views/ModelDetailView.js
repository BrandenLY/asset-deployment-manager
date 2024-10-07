import React from 'react'
import GenericDetailView from '../components/GenericDetailView'
import { Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { useModelOptions } from '../customHooks'

const MODELNAME = 'model'

const ModelDetailView = props => {
    
    const locationParams = useParams();

    const obj = useQuery({
        queryKey: [MODELNAME, locationParams.id]
    })

    return (
        <GenericDetailView
            {...props}
            model={MODELNAME}
            title={
                <Typography component="span" fontSize="inherit" fontWeight="inherit">
                    { obj.isSuccess ? obj.data.label : `Unknown ${MODELNAME}`}
                </Typography>
            }
            detailFormLayout = {[
                ['id', null],
                ['name'],
                ['model_code'],
                ['description'],
                ['manufacturer'],
                ['icon']
            ]}
        >

            {/* Model/Page specific content can be added here */}

        </GenericDetailView>
    )
}

export default ModelDetailView;