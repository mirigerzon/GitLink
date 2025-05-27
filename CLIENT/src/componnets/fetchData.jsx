import Cookies from 'js-cookie';
export const fetchData = ({ type, params = {}, method = "GET", body = null, onSuccess, onError, logOut = null }) => {
    const query = method === "GET" ? `?${new URLSearchParams(params).toString()}` : "";
    const url = `http://localhost:3001/${type}${query}`;
    const token = Cookies.get('accessToken');
    const options = (tokenToUse) => ({
        method,
        credentials: 'include',
        headers: {
            "Content-Type": "application/json",
            ...(tokenToUse && { Authorization: `Bearer ${tokenToUse}` }),
        },
        ...(body && { body: JSON.stringify(body) }),
    });

    fetch(url, options(token))
        .then(response => {
            if (response.status === 401) {
                return fetch('http://localhost:3001/refresh', {
                    method: 'POST',
                    credentials: 'include',
                })
                    .then(refreshRes => {
                        if (!refreshRes.ok) {
                            logOut();
                            throw new Error('Session expired. Please login again.');
                        }
                        return refreshRes.json();
                    })
                    .then(data => {
                        Cookies.set('accessToken', data.token);
                        return fetch(url, options(data.token));
                    });
            }
            return response;
        })
        .then(response => {
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (onSuccess) onSuccess(data);
        })
        .catch(error => {
            console.error(error);
            if (onError) onError(error.message);
        });
};
