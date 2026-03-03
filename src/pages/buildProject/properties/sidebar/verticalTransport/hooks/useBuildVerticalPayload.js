import { getCurrentUser } from '../../../../../../helpers/utils';
import { useSelector } from 'react-redux';

export const useBuildVerticalPayload = ({ decodedId }) => {
    const projectData = useSelector((state) => state.api.projectData);
    
    
    const build = (values,id) => { 
        const user       = getCurrentUser()?.user;
        const customerId = projectData?.enc_customer_id ?? user?.common_id; 

        const payload = { 
            id : 0,
            customer_id:    customerId,
            project_id:     decodedId,

            vt_name:    values.vt_name ?? 'New vertical transport',
            icon_id:    values.icon ?? 16,
            is_wheelchair : values?.is_wheelchair ?? 0,
            movement_direction:values?.movement_direction ?? 'bidirectional',
            vt_color:   values.vt_color ?? projectData?.level_change_color,  
            connection_pins: extractConnections(values.connectionPins, id )

        }; 
        
        if (values.enc_id) {
            payload.id           = values.enc_id;
            payload.is_published = '0';
            payload.discard      = '1';
            payload.publish      = '1';
        } 
        
        return payload;
    };
    
    return build;
};

const extractConnections = (pins = []) =>{
    let nomalizedPins =  pins.map(item => ({
        id : item?.id ?? 0,
        floor_plan_id: item?.value,
        positions: item?.position || null, 
    }))

    return nomalizedPins.filter(item => item.positions !== null)
 };