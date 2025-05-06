package com.example.backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class SavingsGoalDTO {
    private String name;

    public SavingsGoalDTO() {
    }

    public SavingsGoalDTO(String name, String description, Double targetAmount, LocalDate targetDate) {
        this.name = name;
        this.description = description;
        this.targetAmount = targetAmount;
        this.targetDate = targetDate;
    }

    private String description;
    private Double targetAmount;
    private LocalDate targetDate;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getTargetAmount() {
        return targetAmount;
    }

    public void setTargetAmount(Double targetAmount) {
        this.targetAmount = targetAmount;
    }

    public LocalDate getTargetDate() {
        return targetDate;
    }

    public void setTargetDate(LocalDate targetDate) {
        this.targetDate = targetDate;
    }
}