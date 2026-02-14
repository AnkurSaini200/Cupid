import client from './client';

export const getNearbyUsers = async (params) => {
    const response = await client.get('/users/nearby', { params });
    return response.data;
};

export const getUserProfile = async (userId) => {
    const response = await client.get(`/users/${userId}`);
    return response.data;
};

export const updateUserProfile = async (userId, updates) => {
    const response = await client.put(`/users/${userId}`, updates);
    return response.data;
};

export const uploadPhoto = async (userId, photoUrl) => {
    const response = await client.post(`/users/${userId}/photos`, { photoUrl });
    return response.data;
};

export const getFriends = async (userId) => {
    const response = await client.get(`/users/${userId}/friends`);
    return response.data;
};
