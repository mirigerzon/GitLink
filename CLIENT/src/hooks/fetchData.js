import Cookies from 'js-cookie';

export const fetchData = (props) => {
    const { role = "", type, params = {}, method = "GET", body = null, onSuccess, onError, logOut = null } = props;

    const query = method === "GET" ? `?${new URLSearchParams(params).toString()}` : "";
    const url = `http://localhost:3001${role}/${type}${query}`;
    const token = Cookies.get('accessToken');

    const options = (tokenToUse) => {
        const headers = {
            ...(tokenToUse && { Authorization: `Bearer ${tokenToUse}` }),
        };
        if (!(body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }
        return {
            method,
            credentials: 'include',
            headers,
            ...(body && { body: body instanceof FormData ? body : JSON.stringify(body) }),
        };
    };

    fetch(url, options(token))
        .then(response => {
            if (response.status === 401) {
                return fetch('http://localhost:3001/refresh', {
                    method: 'POST',
                    credentials: 'include',
                })
                    .then(refreshRes => {
                        if (!refreshRes.ok) {
                            logOut && logOut();
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
        .then(async response => {
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw data;
            return data;
        })
        .then(data => {
            if (onSuccess) onSuccess(data);
        })
        .catch(error => {
            console.error(error);
            if (onError) onError(error.message || error.error || JSON.stringify(error));
        });
};