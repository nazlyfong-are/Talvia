/*
   LANDING PAGE — captura de correo en CTA final
   Redirige al registro con el correo pre-cargado
 */

document.getElementById('cta-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const correo = document.getElementById('cta-email').value.trim();
    window.location.href = `/public/form?correo=${encodeURIComponent(correo)}`;
});