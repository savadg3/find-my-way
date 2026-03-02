import { getCurrentUser } from '../../../../../../helpers/utils';
import { useSelector } from 'react-redux';

export const useBuildAmenityPayload = ({ decodedId }) => {
    const projectData = useSelector((state) => state.api.projectData);
    const currentFloor   = useSelector((state) => state.api.currentFloor);
    
    
    const build = (values) => { 
        const user       = getCurrentUser()?.user;
        const customerId = projectData?.enc_customer_id ?? user?.common_id;
        
        const payload = { 
            customer_id:    customerId,
            project_id:     decodedId,
            floor_plan_id:  values.position === null ? null : (values.enc_floor_plan_id ?? currentFloor?.enc_id), 
            positions:      values.position ?? null,
            amenity_name:   values.amenity_name ?? '! New amenity',
            icon_id:        values.icon_id ?? 1,
            amenity_color:  values.amenity_color ?? projectData?.amenity_color,  
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