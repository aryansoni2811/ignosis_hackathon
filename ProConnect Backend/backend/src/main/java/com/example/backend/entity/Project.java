package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
@Data
public class Project {

    @Getter
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Getter
    @Column(nullable = false)
    private String title;

    @Getter
    @Column(nullable = false, length = 1000)
    private String description;

    @Getter
    @Column(nullable = false)
    private Double budget;

    @Getter
    @Column(nullable = false)
    private LocalDate deadline;

    @Getter
    @Column(nullable = false)
    private String requiredSkills;

    @Getter
    @Column(nullable = false)
    private String category;

    public void setCategory(String category) {
        this.category = category;
    }

    public void setFreelancer(Freelancer freelancer) {
        this.freelancer = freelancer;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    @Getter
    @Column(nullable = false)
    private String status = "Open"; // Open, In Progress, Completed

    @Getter
    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @Getter
    @ManyToOne
    @JoinColumn(name = "freelancer_id")
    private Freelancer freelancer;

    @Getter
    @Column
    private LocalDateTime completedAt;



    @Getter
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Getter
    @Column
    private LocalDateTime updatedAt;

    @Column
    private Boolean isPaid = false;

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setBudget(Double budget) {
        this.budget = budget;
    }

    public void setDeadline(LocalDate deadline) {
        this.deadline = deadline;
    }

    public void setRequiredSkills(String requiredSkills) {
        this.requiredSkills = requiredSkills;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setClient(Client client) {
        this.client = client;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Boolean getPaid() {
        return isPaid;
    }

    public void setPaid(Boolean paid) {
        isPaid = paid;
    }
}