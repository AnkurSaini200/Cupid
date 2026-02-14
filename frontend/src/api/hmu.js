import client from './client';

export const getFeed = async () => {
    const response = await client.get('/hmu/feed');
    return response.data;
};

export const getPost = async (postId) => {
    const response = await client.get(`/hmu/${postId}`);
    return response.data;
};

export const createPost = async (postData) => {
    const response = await client.post('/hmu/create', postData);
    return response.data;
};

export const respondToPost = async (postId, message) => {
    const response = await client.post(`/hmu/${postId}/respond`, { message });
    return response.data;
};

export const getMyPosts = async (userId) => {
    const response = await client.get(`/hmu/user/${userId}`);
    return response.data;
};

export const deletePost = async (postId) => {
    const response = await client.delete(`/hmu/${postId}`);
    return response.data;
};
