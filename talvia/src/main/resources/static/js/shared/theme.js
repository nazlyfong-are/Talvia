/* ============================================
   TEMA CLARO / OSCURO
   - Aplica el tema guardado antes de que se pinte la página (sin parpadeo).
   - Agrega el botón 🌙 / ☀️ al header (igual en trabajador, empresa y admin).
   - Guarda la elección en localStorage: se conserva entre páginas y visitas.
   Se carga de forma síncrona desde el <head> (fragments/shared-css).
============================================ */
(function () {
    const CLAVE = 'talvia-tema';
    const raiz = document.documentElement;

    function leerGuardado() {
        try {
            const t = localStorage.getItem(CLAVE);
            return t === 'dark' || t === 'light' ? t : null;
        } catch (e) { return null; }
    }

    function guardar(tema) {
        try { localStorage.setItem(CLAVE, tema); } catch (e) { /* modo privado: dura solo esta página */ }
    }

    function actual() {
        return raiz.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    }

    function pintarBoton() {
        const btn = document.getElementById('theme-toggle');
        if (!btn) return;
        const oscuro = actual() === 'dark';
        btn.textContent = oscuro ? '☀️' : '🌙';
        btn.title = oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
        btn.setAttribute('aria-label', btn.title);
        btn.setAttribute('aria-pressed', String(oscuro));
    }

    function aplicar(tema) {
        raiz.setAttribute('data-theme', tema);
        pintarBoton();
    }

    function alternar() {
        const nuevo = actual() === 'dark' ? 'light' : 'dark';
        raiz.classList.add('theme-anim');        // transición suave solo durante el cambio
        aplicar(nuevo);
        guardar(nuevo);
        setTimeout(() => raiz.classList.remove('theme-anim'), 350);
    }

    // Se ejecuta antes del primer pintado. Sin elección guardada, queda en claro.
    aplicar(leerGuardado() || 'light');

    function crearBoton() {
        if (document.getElementById('theme-toggle')) return;
        const barra = document.querySelector('header.top .top-inner');
        if (!barra) return;   // páginas sin este header (login, registro…): no hay botón

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'theme-toggle';
        btn.className = 'theme-toggle';
        btn.addEventListener('click', alternar);

        // Va justo antes de "Cerrar Sesión"; si no existe, al final de la barra
        const salir = document.getElementById('logoutBtn');
        if (salir && salir.parentElement === barra) barra.insertBefore(btn, salir);
        else barra.appendChild(btn);

        pintarBoton();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', crearBoton);
    else crearBoton();

    // Si cambias el tema en otra pestaña, esta se actualiza sola
    window.addEventListener('storage', (e) => {
        if (e.key === CLAVE && (e.newValue === 'dark' || e.newValue === 'light')) aplicar(e.newValue);
    });
})();