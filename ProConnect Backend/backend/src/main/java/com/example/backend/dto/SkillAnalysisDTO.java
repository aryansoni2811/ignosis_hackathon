package com.example.backend.dto;

import lombok.Data;

@Data
public class SkillAnalysisDTO {
    private String skill;
    private Long totalApplications;
    private Long wonProjects;
    private String feedback;

    // Constructor, getters

    public SkillAnalysisDTO(String skill, Long totalApplications, Long wonProjects, String feedback) {
        this.skill = skill;
        this.totalApplications = totalApplications;
        this.wonProjects = wonProjects;
        this.feedback = feedback;
    }
}
