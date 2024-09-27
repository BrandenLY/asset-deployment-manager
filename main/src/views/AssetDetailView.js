import React from 'react'
import GenericDetailView from '../components/GenericDetailView'
import AssetIcon from '../components/AssetIcon'
import { Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { useModelOptions } from '../customHooks'

const MODELNAME = 'asset'

const AssetDetailView = props => {
    
    const locationParams = useParams();
    const modelOptions = useModelOptions(MODELNAME);

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
                ['model', 'code'],
                ['condition'],
                ['serial_number'],
                ['iccid'],
                ['imei'],
                ['knox_id'],
                ['location'],
                ['note'],
                ['date_created', 'last_modified']
            ]}
        >

            {/* Model/Page specific content can be added here */}

        </GenericDetailView>
    )
}

export default AssetDetailView;