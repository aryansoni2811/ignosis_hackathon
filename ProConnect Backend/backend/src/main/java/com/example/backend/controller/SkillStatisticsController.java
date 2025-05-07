package com.example.backend.controller;

import com.example.backend.entity.SkillStatisticsEntity;
import com.example.backend.entity.SkillStatisticsEntity;
import com.example.backend.repository.SkillStatisticsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// SkillStatisticsController.java
@RestController
@RequestMapping("/api/skills")
public class SkillStatisticsController {

    @Autowired
    private SkillStatisticsRepository skillStatisticsRepository;

    @GetMapping("/stats")
    public ResponseEntity<List<SkillStatisticsEntity>> getSkillStatistics() {
        List<SkillStatisticsEntity> stats = skillStatisticsRepository.findAllByOrderByCountDesc();
        return ResponseEntity.ok(stats);
    }
}
