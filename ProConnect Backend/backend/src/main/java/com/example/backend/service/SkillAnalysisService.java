package com.example.backend.service;

import com.example.backend.dto.SkillAnalysisDTO;
import com.example.backend.repository.ApplicationTrackingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SkillAnalysisService {

    private final ApplicationTrackingRepository applicationTrackingRepo;

    @Autowired
    public SkillAnalysisService(ApplicationTrackingRepository applicationTrackingRepo) {
        this.applicationTrackingRepo = applicationTrackingRepo;
    }

    public List<SkillAnalysisDTO> analyzeSkills(Long freelancerId) {
        List<Object[]> rawStats = applicationTrackingRepo.getSkillStatsByFreelancer(freelancerId);

        return rawStats.stream().map(result -> {
            String skill = (String) result[0];
            Long total = (Long) result[1];
            Long won = (Long) result[2];

            String feedback = generateFeedback(skill, total, won);

            return new SkillAnalysisDTO(skill, total, won, feedback);
        }).collect(Collectors.toList());
    }

    private String generateFeedback(String skill, Long total, Long won) {
        double successRate = (double) won / total;

        if (total < 3) {
            return String.format("You've applied to %d %s jobs. Apply to more to get better insights.", total, skill);
        } else if (successRate < 0.3) {
            return String.format("You applied to %d %s jobs, got %d. Consider upskilling.", total, skill, won);
        } else if (successRate > 0.7) {
            return String.format("Great performance! You won %d/%d %s projects.", won, total, skill);
        } else {
            return String.format("You won %d/%d %s projects. Keep improving!", won, total, skill);
        }
    }
}
