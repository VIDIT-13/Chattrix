import { StreamChat } from 'stream-chat';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if(!apiKey || !apiSecret) {
    throw new Error("STREAM_API_KEY and STREAM_API_SECRET must be set in .env file");
}

const serverClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
    if (!userData.id) {
        throw new Error('User ID is required for Stream user creation');
    }

    console.log('Attempting to create Stream user with data:', {
        id: userData.id,
        name: userData.name,
        image: userData.image
    });

    try {
        const response = await serverClient.upsertUsers([
            {
                id: userData.id,
                name: userData.name,
                image: userData.image
            }
        ]);
        
        console.log('Stream user creation response:', response);
        return response;
    } catch (error) {
        console.error('Detailed Stream error:', {
            message: error.message,
            response: error.response,
            status: error.status,
        });
        throw error;
    }
};

export const generateStreamToken = (userId) => {
    if (!userId) {
        throw new Error('User ID is required for token generation');
    }
    const userIdStr = userId.toString();

    try {
        const token = serverClient.createToken(userIdStr);
        return token;
    } catch (error) {
        console.error('Error generating Stream token:', error);
        throw error;
    }
};