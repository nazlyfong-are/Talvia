package com.talvia.talvia.servicesIMPL;

public class PlantillasEmail {

    private static final String COLOR_INK = "#0c374a";
    private static final String COLOR_GOLD = "#feedca";

    public static String bienvenidaTrabajador(String nombre) {
        return envolver(
            "¡Bienvenido a Talvia, " + nombre + "!",
            "Tu cuenta de candidato ya está activa. Ahora puedes completar tu hoja de vida, " +
            "subir tus certificados y postularte a las vacantes que más te interesen."
        );
    }

    public static String bienvenidaEmpresa(String razonSocial) {
        return envolver(
            "¡Bienvenido a Talvia, " + razonSocial + "!",
            "Tu cuenta empresarial ya está activa. Ya puedes publicar vacantes y empezar a recibir " +
            "candidatos calificados para tus procesos de selección."
        );
    }

    public static String vacantePublicada(String razonSocial, String tituloVacante) {
        return envolver(
            "¡Tu vacante ya está publicada!",
            "Hola " + razonSocial + ", tu oferta laboral \"" + tituloVacante + "\" ya está activa y visible " +
            "para todos los candidatos de Talvia. Te notificaremos apenas recibas tu primer postulante."
        );
    }

    public static String nuevoCandidato(String razonSocial, String nombreCandidato, String tituloVacante) {
        return envolver(
            "¡Tienes un nuevo candidato!",
            "Hola " + razonSocial + ", <b>" + nombreCandidato + "</b> se acaba de postular a tu vacante " +
            "\"" + tituloVacante + "\". Ingresa a tu panel de Talvia para revisar su hoja de vida y sus respuestas."
        );
    }

    public static String cambioEstadoPostulacion(String nombreTrabajador, String tituloVacante, String razonSocial, String nuevoEstado) {
        String mensajeEstado;
        switch (nuevoEstado) {
            case "ACEPTADO":
                mensajeEstado = "¡Buenas noticias! <b>" + razonSocial + "</b> te ha aceptado para continuar en el proceso de \"" + tituloVacante + "\". Es probable que se pongan en contacto contigo pronto.";
                break;
            case "RECHAZADO":
                mensajeEstado = "<b>" + razonSocial + "</b> ha decidido no continuar tu proceso para \"" + tituloVacante + "\" en esta ocasión. ¡No te desanimes, sigue explorando otras oportunidades en Talvia!";
                break;
            case "EN_PROCESO":
                mensajeEstado = "<b>" + razonSocial + "</b> está revisando tu perfil para \"" + tituloVacante + "\". Te avisaremos apenas haya novedades.";
                break;
            default:
                mensajeEstado = "El estado de tu postulación a \"" + tituloVacante + "\" con " + razonSocial + " ha cambiado.";
        }
        return envolver("Actualización de tu postulación", "Hola " + nombreTrabajador + ", " + mensajeEstado);
    }

    public static String codigoRecuperarContrasena(String codigo) {
        return envolver(
            "Recupera tu contraseña",
            "Recibimos una solicitud para restablecer tu contraseña en Talvia. Usa este código para continuar:<br><br>" +
            "<div style='background:#f6f8f8; padding:16px; text-align:center; font-size:28px; font-weight:bold; letter-spacing:6px; border-radius:8px;'>" + codigo + "</div><br>" +
            "Este código expira en 15 minutos. Si no solicitaste este cambio, ignora este correo."
        );
    }

    public static String codigoEliminarCuenta(String codigo) {
        return envolver(
            "Confirma la eliminación de tu cuenta",
            "Recibimos una solicitud para eliminar permanentemente tu cuenta de Talvia. Usa este código para confirmar:<br><br>" +
            "<div style='background:#fdecec; color:#d93838; padding:16px; text-align:center; font-size:28px; font-weight:bold; letter-spacing:6px; border-radius:8px;'>" + codigo + "</div><br>" +
            "Esta acción es irreversible. Si no solicitaste esto, ignora este correo y tu cuenta seguirá activa."
        );
    }

    private static String envolver(String titulo, String mensaje) {
        return "<div style='font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;'>"
             + "<div style='background:" + COLOR_INK + "; padding: 24px; text-align:center;'>"
             + "<span style='color:" + COLOR_GOLD + "; font-size: 22px; font-weight: bold;'>Talvia</span>"
             + "</div>"
             + "<div style='padding: 24px; background:#ffffff; border:1px solid #dfe6ea;'>"
             + "<h2 style='color:" + COLOR_INK + ";'>" + titulo + "</h2>"
             + "<p style='color:#333; line-height:1.6;'>" + mensaje + "</p>"
             + "</div>"
             + "<div style='padding:12px; text-align:center; font-size:12px; color:#5c7688;'>"
             + "© 2026 Talvia — Plataforma de empleo"
             + "</div>"
             + "</div>";
    }
}