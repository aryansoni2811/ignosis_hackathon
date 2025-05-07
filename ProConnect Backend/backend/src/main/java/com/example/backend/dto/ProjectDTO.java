package com.example.backend.dto;

import java.time.LocalDate;
import java.util.Map;

public class ProjectDTO {
    private Long id;
    private String title;
    private String description;
    private Double budget;
    private LocalDate deadline;
    private String requiredSkills;
    private String category;
    private String status;
    private String clientEmail;
    private Long freelancerId;
    private String freelancerName;
    private String freelancerEmail;
    private Boolean isPaid;
    private Boolean hasRated;
    private Map<String, Object> freelancerRating;

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getBudget() {
        return budget;
    }

    public void setBudget(Double budget) {
        this.budget = budget;
    }

    public LocalDate getDeadline() {
        return deadline;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }

    public String getRequiredSkills() {
        return requiredSkills;
    }

    public void setRequiredSkills(String requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getClientEmail() {
        return clientEmail;
    }

    public void setClientEmail(String clientEmail) {
        this.clientEmail = clientEmail;
    }

    public Long getFreelancerId() {
        return freelancerId;
    }

    public void setFreelancerId(Long freelancerId) {
        this.freelancerId = freelancerId;
    }

    public String getFreelancerName() {
        return freelancerName;
    }

    public void setFreelancerName(String freelancerName) {
        this.freelancerName = freelancerName;
    }

    public String getFreelancerEmail() {
        return freelancerEmail;
    }

    public void setFreelancerEmail(String freelancerEmail) {
        this.freelancerEmail = freelancerEmail;
    }

    public Boolean getIsPaid() {
        return isPaid;
    }

    public void setIsPaid(Boolean isPaid) {
        this.isPaid = isPaid;
    }

    public Boolean getHasRated() {
        return hasRated;
    }

    public void setHasRated(Boolean hasRated) {
        this.hasRated = hasRated;
    }

    public Map<String, Object> getFreelancerRating() {
        return freelancerRating;
    }

    public void setFreelancerRating(Map<String, Object> freelancerRating) {
        this.freelancerRating = freelancerRating;
    }
}