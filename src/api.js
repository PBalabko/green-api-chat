const BASE_URL = 'https://api.green-api.com';

export const sendMessage = async (idInstance, apiToken, chatId, message) => {
    const url = `${BASE_URL}/waInstance${idInstance}/sendMessage/${apiToken}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, message }),
    });

    if (!response.ok) {
        throw new Error('Ошибка отправки сообщения');
    }

    return await response.json();
};

export const receiveNotification = async (idInstance, apiToken) => {
    const url = `${BASE_URL}/waInstance${idInstance}/receiveNotification/${apiToken}?receiveTimeout=5`;

    const response = await fetch(url);
    return await response.json();
};

export const deleteNotification = async (idInstance, apiToken, receiptId) => {
    const url = `${BASE_URL}/waInstance${idInstance}/deleteNotification/${apiToken}/${receiptId}`;

    const response = await fetch(url, { method: 'DELETE' });
    return await response.json();
};