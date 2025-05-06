package com.example.backend.entity;

import jakarta.persistence.*;
import jakarta.persistence.Id;

// SkillStatistics.java
@Entity
@Table(name = "skill_statistics")
public class SkillStatisticsEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "skill_name", unique = true)
    private String skillName;

    private Integer count = 0;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public Integer getCount() {
        return count;
    }

    public void setCount(Integer count) {
        this.count = count;
    }
}
