import { postRequest, getRequest } from '../../../../../hooks/axiosClient';

export const saveNavigationPaths = (projectId, paths) =>
    postRequest('project-navigation', {
        id:    projectId,
        paths: JSON.stringify(paths),
    });

export const loadNavigationPaths = async (projectId) => {
    const response = await getRequest(`project-navigation/${projectId}`);
    const raw = response?.data?.paths;
    if (!raw) return [];
    try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};
