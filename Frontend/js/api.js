// js/api.js
const BASE_URL = 'http://localhost:3000/api';

async function apiFetch(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };

    if (body) options.body = JSON.stringify(body);

    try {
        console.log(`[API] ${method} ${BASE_URL}${endpoint}`); // logs every request
        const res = await fetch(`${BASE_URL}${endpoint}`, options);
        const data = await res.json();
        console.log(`[API] Response:`, data); // logs every response
        return data;
    } catch (err) {
        console.error(`[API] Error on ${method} ${endpoint}:`, err);
    }
}