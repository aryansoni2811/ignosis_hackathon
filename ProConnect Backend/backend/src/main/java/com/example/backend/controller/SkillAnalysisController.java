package com.example.backend.controller;

import com.example.backend.dto.SkillAnalysisDTO;
import com.example.backend.service.SkillAnalysisService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/skill-analysis")
public class SkillAnalysisController {

    private final SkillAnalysisService skillAnalysisService;

    public SkillAnalysisController(SkillAnalysisService skillAnalysisService) {
        this.skillAnalysisService = skillAnalysisService;
    }

    @GetMapping("/{freelancerId}")
    public ResponseEntity<List<SkillAnalysisDTO>> getSkillAnalysis(@PathVariable Long freelancerId) {
        List<SkillAnalysisDTO> analysis = skillAnalysisService.analyzeSkills(freelancerId);
        return ResponseEntity.ok(analysis);
    }
}
