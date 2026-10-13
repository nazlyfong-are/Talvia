(function () {
    const METODOS_SEGUROS = ['GET', 'HEAD', 'OPTIONS'];
    const fetchOriginal = window.fetch.bind(window);

    function leerCookie(nombre) {
        const m = document.cookie.match(new RegExp('(?:^|; )' + nombre + '=([^;]*)'));
        return m ? decodeURIComponent(m[1]) : null;
    }

    window.fetch = function (input, init) {
        init = init || {};
        const esRequest = input instanceof Request;
        const metodo = (init.method || (esRequest ? input.method : 'GET')).toUpperCase();

        if (!METODOS_SEGUROS.includes(metodo)) {
            const url = new URL(esRequest ? input.url : input, window.location.origin);

            // El token solo viaja hacia nuestro propio servidor, nunca hacia otros orígenes
            if (url.origin === window.location.origin) {
                const token = leerCookie('XSRF-TOKEN');
                if (token) {
                    const headers = new Headers(init.headers || (esRequest ? input.headers : undefined));
                    headers.set('X-XSRF-TOKEN', token);
                    init = { ...init, headers };
                }
            }
        }
        return fetchOriginal(input, init);
    };
})();