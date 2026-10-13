/*
   DASHBOARD EMPRESA - Utilidades compartidas
 */

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.emp-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => cambiarSeccion(btn.dataset.target, btn));
    });
    document.getElementById('logoutBtn').addEventListener('click', cerrarSesion);
});

function cambiarSeccion(idSeccion, boton) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.emp-nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(idSeccion).classList.add('active');
    boton.classList.add('active');
}

async function cerrarSesion() {
    try { await fetch('/api/auth/logout', { method: 'POST' }); }
    finally { window.location.href = '/public/login'; }
}

function showToast(message, type = 'default') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    void toast.offsetWidth;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3800);
}