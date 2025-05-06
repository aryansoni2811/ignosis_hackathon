package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class Freelancer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String email;
    private String password;

    @Lob
    @Column(name = "profile_image", columnDefinition = "LONGBLOB")
    private byte[] profileImage;

    private String profileImageContentType;

    public byte[] getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(byte[] profileImage) {
        this.profileImage = profileImage;
    }

    public String getProfileImageContentType() {
        return profileImageContentType;
    }

    public void setProfileImageContentType(String profileImageContentType) {
        this.profileImageContentType = profileImageContentType;
    }

    @Column(nullable = false, columnDefinition = "double default 0.0")
    private Double earnings = 0.0;

    @OneToMany(mappedBy = "freelancer", fetch = FetchType.EAGER , cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Skill> skills = new ArrayList<>();


    @OneToOne(mappedBy = "freelancer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private FinancialSettings financialSettings;

    @OneToMany(mappedBy = "freelancer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<SavingsGoal> savingsGoals;

    public Freelancer() {
    }

    public Freelancer(Long id, String name, String email, String password, byte[] profileImage, String profileImageContentType, Double earnings, List<Skill> skills, FinancialSettings financialSettings, List<SavingsGoal> savingsGoals) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.profileImage = profileImage;
        this.profileImageContentType = profileImageContentType;
        this.earnings = earnings;
        this.skills = skills;
        this.financialSettings = financialSettings;
        this.savingsGoals = savingsGoals;
    }

    public FinancialSettings getFinancialSettings() {
        return financialSettings;
    }

    public void setFinancialSettings(FinancialSettings financialSettings) {
        this.financialSettings = financialSettings;
    }

    public List<SavingsGoal> getSavingsGoals() {
        return savingsGoals;
    }

    public void setSavingsGoals(List<SavingsGoal> savingsGoals) {
        this.savingsGoals = savingsGoals;
    }
// Getters and setters remain the same

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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Double getEarnings() {
        return earnings;
    }

    public void setEarnings(Double earnings) {
        this.earnings = earnings;
    }

    public List<Skill> getSkills() {
        return skills;
    }

    public void setSkills(List<Skill> skills) {
        this.skills = skills;
    }
}