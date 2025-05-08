package com.example.backend.dto;

import com.example.backend.entity.Skill;

public class SkillDTO {
    private Long id;
    private String name;
    private String proficiency;

    // Default constructor
    public SkillDTO() {
    }

    // Static factory method
    public static SkillDTO fromEntity(Skill skill) {
        if (skill == null) {
            return null;
        }

        SkillDTO dto = new SkillDTO();
        dto.setId(skill.getId());
        dto.setName(skill.getName());
        dto.setProficiency(skill.getProficiency());
        return dto;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getProficiency() {
        return proficiency;
    }

    public void setProficiency(String proficiency) {
        this.proficiency = proficiency;
    }
}