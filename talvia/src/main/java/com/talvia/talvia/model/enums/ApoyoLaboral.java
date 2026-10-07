package com.talvia.talvia.model.enums;

public enum ApoyoLaboral {
        // Respuestas de salida: se excluyen entre sí y con cualquier otra opción
    NINGUNO, DESPUES,

    // Para la entrevista y las pruebas
    PROC_INTERPRETE_LSC, PROC_SUBTITULOS, PROC_ESCRITO, PROC_AGENDA, PROC_TIEMPO, PROC_LUGAR,

    // Comunicación
    COM_LSC, COM_INTERPRETE, COM_ESCRITA, COM_SUBTITULOS, COM_DE_FRENTE, COM_INSTRUCCIONES,

    // El espacio de trabajo
    ESP_SIN_ESCALERAS, ESP_AMPLIO, ESP_BANO, ESP_PUESTO, ESP_DESCANSO, ESP_PARQUEO,

    // Pantalla y tecnología
    TEC_LECTOR, TEC_CONTRASTE, TEC_TEXTO, TEC_DOCS, TEC_TECLADO, TEC_DICTADO,

    // Cómo se organiza el trabajo
    ORG_HORARIO, ORG_REMOTO, ORG_PAUSAS, ORG_TAREAS, ORG_AVISO, ORG_TRANQUILO
}
