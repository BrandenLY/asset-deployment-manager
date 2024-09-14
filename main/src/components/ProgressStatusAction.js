import React from 'react'
import { Button } from '@mui/material';

import { useModelOptions } from '../customHooks';

const ProgressStatusAction = props => {

  // PROPS DESTRUCTURING
  const {model, object, progressVar="status", actions, buttonProps={}} = props;

  // STATE HOOKS
  const modelOptions = useModelOptions(model);

  // CALLBACK FUNCTIONS
  const executeOnClick = e => {
    e.preventDefault();
    console.log(e);
  }
  
  // FORMATTED DATA
  const nextStatus = object != null && modelOptions.isSuccess == true ? 
  modelOptions.data.model_fields[progressVar].choices.find(
    i => i.value == object.status + 1
  ) : null;

  return (
    <Button variant="contained" {...buttonProps} value={nextStatus?.display_name} onClick={executeOnClick}>
        Set {progressVar} to {nextStatus?.display_name}
    </Button>
  )
}

export default ProgressStatusAction;