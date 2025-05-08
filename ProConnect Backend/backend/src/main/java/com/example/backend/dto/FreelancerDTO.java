package com.example.backend.dto;

import com.example.backend.entity.Freelancer;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class FreelancerDTO {
    private Long id;
    private String name;
    private String email;
    private List<SkillDTO> skills = new ArrayList<>();  // Use SkillDTO instead of Skill entity
    private Double earnings;

    // Default constructor
    public FreelancerDTO() {
    }

    // Static factory method to convert entity to DTO
    public static FreelancerDTO fromEntity(Freelancer freelancer) {
        if (freelancer == null) {
            return null;
        }

        FreelancerDTO dto = new FreelancerDTO();
        dto.setId(freelancer.getId());
        dto.setName(freelancer.getName());
        dto.setEmail(freelancer.getEmail());

        // Convert skills to DTOs safely
        if (freelancer.getSkills() != null) {
            dto.setSkills(
                    freelancer.getSkills().stream()
                            .map(SkillDTO::fromEntity)
                            .filter(s -> s != null)  // Filter out nulls for safety
                            .collect(Collectors.toList())
            );
        }

        dto.setEarnings(freelancer.getEarnings());

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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public List<SkillDTO> getSkills() {
        return skills;
    }

    public void setSkills(List<SkillDTO> skills) {
        this.skills = skills;
    }

    public Double getEarnings() {
        return earnings;
    }

    public void setEarnings(Double earnings) {
        this.earnings = earnings;
    }
}