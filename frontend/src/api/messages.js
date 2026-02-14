import client from './client';

export const getConversations = async (userId) => {
    const response = await client.get(`/messages/conversations/${userId}`);
    return response.data;
};

export const getMessages = async (conversationId) => {
    const response = await client.get(`/messages/${conversationId}`);
    return response.data;
};

export const sendMessage = async (messageData) => {
    const response = await client.post('/messages/send', messageData);
    return response.data;
};

export const searchMessages = async (userId, query) => {
    const response = await client.get(`/messages/search/${userId}`, {
        params: { query }
    });
    return response.data;
};
