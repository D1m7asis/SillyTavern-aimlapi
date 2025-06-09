import express from 'express';
import fetch from 'node-fetch';

import { readSecret, SECRET_KEYS } from './secrets.js';

export const router = express.Router();

router.post('/generate-image', async (request, response) => {
    try {
        const key = readSecret(request.user.directories, SECRET_KEYS.AIMLAPI);

        if (!key) {
            console.warn('No AI/ML API key found');
            return response.sendStatus(400);
        }

        console.debug('AI/ML API image request', request.body);
        const result = await fetch('https://api.aimlapi.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${key}`,
            },
            body: JSON.stringify(request.body),
        });

        if (!result.ok) {
            const text = await result.text();
            console.warn('AI/ML API request failed', result.statusText, text);
            return response.status(500).send(text);
        }

        const data = await result.json();
        return response.json(data);
    } catch (error) {
        console.error(error);
        response.status(500).send('Internal server error');
    }
});
