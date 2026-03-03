import { environmentaldatas } from '../../../../../../constant/defaultValues';
import { getCurrentUser } from '../../../../../../helpers/utils';
import { getRequest, postRequest, deleteRequest } from '../../../../../../hooks/axiosClient'; 
 

const { image_url } = environmentaldatas;

export const fetchFloorPlans = async (projectId) => {
    const response = await getRequest(`list-floor-plan/${projectId}`);
    return response.data ?? [];
};

export const fetchFloorPlanById = async (floorId) => {
    const response = await getRequest(`floor-plan/${floorId}`);
    return response.data ?? {};
};

export const deleteFloorPlan = async (floorId) => {
    const response = await deleteRequest(`floor-plan/${floorId}`);
    return response.data ?? {};
};

export const reorderFloorPlans = async ({ projectId, floors }) => {
    const dragArray = [...floors].reverse().map((floor, index) => ({
        id:         floor.enc_id,
        floor_plan: floor.floor_plan,
        index,
    }));

    const payload = {
        type:         1,
        drag_drop:    dragArray,
        is_published: '0',
        discard:      '1',
        publish:      '1',
        project_id:   projectId,
    };

    const response = await postRequest('drag-drop', payload);
    return response.data ?? {};
};

export const saveFloorPlan = async ({ values, projectData, texts = [], tracings = [] }) => {
    if (!projectData?.enc_id) {
        throw new Error('No project selected');
    }

    const user       = getCurrentUser()?.user;
    const customerId = projectData?.enc_customer_id ?? user?.common_id;
 
    let refImg = null;
    if (values?.image?.name) {
        refImg = values.image;
    } else if (values?.plan) {
        refImg = values.plan.replace(image_url, '');
    }

    const payload = {
        floor_img:    refImg ?? '',
        show_image:   values.show_image ?? 0,
        customer_id:  customerId,
        project_id:   projectData.enc_id,
        file_type:    1,
        floor_plan:   values.floor_plan,
        border_color: values.border_color ?? '',
        border_thick: values.border_thick ?? '',
        fill_color:   values.fill_color   ?? '',
    };

    if (values.enc_id) {
        payload._method      = 'PUT';
        payload.id           = values.enc_id;
        payload.is_published = '0';
        payload.discard      = '1';
        payload.publish      = '1';
        payload.text         = texts.length     ? JSON.stringify(texts)     : '';
        payload.tracings     = tracings.length   ? JSON.stringify(tracings)  : '';
    } else {
        payload.width       = 820;
        payload.height      = 734;
        payload.tracings    = '';
        payload.points_data = '';
        payload.edges_data  = '';
    }

    const formData = new FormData();
    Object.entries(payload).forEach(([key, val]) => formData.append(key, val));

    const reqUrl = values.enc_id ? `floor-plan/${values.enc_id}` : 'floor-plan';
    const response = await postRequest(reqUrl, formData, true);
    return response;
};