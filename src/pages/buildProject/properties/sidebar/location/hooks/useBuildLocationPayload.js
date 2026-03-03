import { getCurrentUser } from '../../../../../../helpers/utils';
import { daysOfWeek } from '../../../../Helpers/constants/constant';
import { useSelector } from 'react-redux';

export const useBuildLocationPayload = ({ decodedId, websiteLinks, hours, isBoundary, boundaryAttributes }) => {
    const projectData = useSelector((state) => state.api.projectData);
    const currentFloor   = useSelector((state) => state.api.currentFloor);
    
    
    const build = (values) => { 
        const user       = getCurrentUser()?.user;
        const customerId = projectData?.enc_customer_id ?? user?.common_id;
        
        const hourObject = {};
        daysOfWeek.forEach((day) => {
            const key = day.toLowerCase();
            hourObject[`${key}_open`]  = hours.hasOwnProperty(day) ? 1 : 0;
            hourObject[`${key}_start`] = hours[day]?.from ?? (hours.hasOwnProperty(day) ? '09:00:00' : '');
            hourObject[`${key}_end`]   = hours[day]?.to   ?? (hours.hasOwnProperty(day) ? '17:30:00' : '');
        });
        
        const filteredWebsites = websiteLinks.filter((obj) =>
            Object.values(obj).some((v) => v !== null && v !== undefined)
    );
    
    const payload = {
        customer_id:    customerId,
        project_id:     decodedId,
        floor_plan_id:  values.position === null ? null : (values.enc_floor_plan_id ?? currentFloor?.enc_id),
        location_name:  values.location_name ?? '! New location',
        tags:           values.tags,
        contact:        values.contact,
        product_code:   values.productCode,
        description:    values.description,
        positions:      values.position ?? null,
        website:        JSON.stringify(filteredWebsites),
        location_color: values.location_color ?? projectData?.location_color,
        boundary_color: isBoundary ? (values.boundary_color ?? '#26A3DB') : null,
        boundary_attributes: isBoundary ? (boundaryAttributes ?? null) : null,
        ...hourObject,
    };
    
    if (values.enc_id) {
        payload.id           = values.enc_id;
        payload.is_published = '0';
        payload.discard      = '1';
        payload.publish      = '1';
    } else {
        payload.promotions = JSON.stringify([]);
    }
    
    return payload;
};

return build;
};