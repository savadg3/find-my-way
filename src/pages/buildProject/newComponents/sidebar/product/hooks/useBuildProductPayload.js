import { getCurrentUser } from '../../../../../../helpers/utils';
import { useSelector } from 'react-redux';

export const useBuildProductPayload = ({ decodedId, websiteLinks, specifications }) => {
    const projectData = useSelector((state) => state.api.projectData);
    const currentFloor   = useSelector((state) => state.api.currentFloor);
    
    
    const build = (values) => { 
        const user       = getCurrentUser()?.user;
        const customerId = projectData?.enc_customer_id ?? user?.common_id;
        
        const payload = {
            
            customer_id:    customerId,
            project_id:     decodedId,
            floor_plan_id:  values.position === null ? null : (values.enc_floor_plan_id ?? currentFloor?.enc_id),
            product_name:   values.product_name,
            tags:           values.tags, 
            product_code:   values.product_code,
            description:    values.description,
            positions:      values.position ?? null,  
            product_color:  values.product_color ?? projectData?.product_color, 
            
            website:         JSON.stringify(websiteLinks ?? []),
            specifications:  JSON.stringify(specifications ?? []), 
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