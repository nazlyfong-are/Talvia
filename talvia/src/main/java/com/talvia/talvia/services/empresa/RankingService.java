package com.talvia.talvia.services.empresa;

import com.talvia.talvia.dto.response.empresa.RankingVacanteDTO;

public interface RankingService {
    RankingVacanteDTO rankingDeVacante(Long empresaId, Long vacanteId);
}