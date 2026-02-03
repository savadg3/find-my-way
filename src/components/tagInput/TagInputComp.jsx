import React from 'react'
import TagsInput from 'react-tagsinput'

import 'react-tagsinput/react-tagsinput.css'
import './tagInput.css'
const TagInputComp = ({ tags, setTags }) => {

    return (
        <TagsInput
            value={tags}
            onChange={setTags}
            className='form-control'
            addKeys={[13]}
            // inputProps={{ placeholder: "Add Tags, Separate Multiple Tags With a Comma" }}
            inputProps={{ placeholder: "Add Tag (Press 'Enter' to confirm)" }}
        />
    )
}

export default TagInputComp