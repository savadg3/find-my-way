import { postRequest, getRequest } from '../../../../../hooks/axiosClient';

export const saveDrawingShapes = (projectId, shapes) =>
    postRequest('project-drawing', {
        id:     projectId,
        shapes: JSON.stringify(shapes),
    });

export const loadDrawingShapes = async (projectId) => {
    const response = await getRequest(`project-drawing/${projectId}`);
    const raw = response?.data?.shapes;
    if (!raw) return [];
    try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};
