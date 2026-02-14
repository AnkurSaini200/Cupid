import client from './client';

export const swipe = async (userId, targetUserId, direction) => {
    const response = await client.post('/matches/swipe', {
        userId,
        targetUserId,
        direction
    });
    return response.data;
};

export const getMatches = async (userId) => {
    const response = await client.get(`/matches/${userId}`);
    return response.data;
};

export const unmatch = async (matchId) => {
    const response = await client.delete(`/matches/${matchId}`);
    return response.data;
};

export const getStats = async (userId) => {
    const response = await client.get(`/matches/${userId}/stats`);
    return response.data;
};
