import client from './client';

export const getCommunities = async () => {
    const response = await client.get('/communities');
    return response.data;
};

export const getCommunity = async (communityId) => {
    const response = await client.get(`/communities/${communityId}`);
    return response.data;
};

export const joinCommunity = async (communityId) => {
    const response = await client.post(`/communities/${communityId}/join`);
    return response.data;
};

export const leaveCommunity = async (communityId) => {
    const response = await client.post(`/communities/${communityId}/leave`);
    return response.data;
};

export const getCommunityPosts = async (communityId) => {
    const response = await client.get(`/communities/${communityId}/posts`);
    return response.data;
};

export const createPost = async (communityId, postData) => {
    const response = await client.post(`/communities/${communityId}/posts`, postData);
    return response.data;
};

export const getCommunityMessages = async (communityId) => {
    const response = await client.get(`/communities/${communityId}/messages`);
    return response.data;
};

export const sendCommunityMessage = async (communityId, messageData) => {
    const response = await client.post(`/communities/${communityId}/messages`, messageData);
    return response.data;
};
