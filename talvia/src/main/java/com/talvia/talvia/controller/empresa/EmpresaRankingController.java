package com.talvia.talvia.controller.empresa;

import com.talvia.talvia.security.UserPrincipal;
import com.talvia.talvia.services.empresa.RankingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/empresa/vacantes")
public class EmpresaRankingController {

    @Autowired
    private RankingService rankingService;

    @GetMapping("/{id}/ranking")
    public ResponseEntity<?> ranking(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        try {
            return ResponseEntity.ok(rankingService.rankingDeVacante(principal.getId(), id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
}