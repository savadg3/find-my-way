import { getCurrentUser } from '../../../../../../helpers/utils';
import { useSelector } from 'react-redux';

export const useBuildBeaconPayload = ({ decodedId, websiteLinks, specifications }) => {
    const projectData = useSelector((state) => state.api.projectData);
    const currentFloor   = useSelector((state) => state.api.currentFloor);
    
    
    const build = (values) => { 
        const user       = getCurrentUser()?.user;
        const customerId = projectData?.enc_customer_id ?? user?.common_id;
        
        const payload = { 
            customer_id:    customerId,
            project_id:     decodedId,
            floor_plan_id:  values.position === null ? null : (values.enc_floor_plan_id ?? currentFloor?.enc_id),
            beacon_name:  values.beacon_name ?? '! New beacon',
            bg_color:  values.bg_color ?? projectData?.beacon_color,
            content_color:  values.content_color,
            heading:        values.heading,
            heading_color: values.heading_color, 
            message: values.message,
            positions:      values.position ?? null,
            subheading: values.subheading,
            subheading_color: values.subheading_color,
            beacon_color: values.beacon_color ?? projectData?.beacon_color,  
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