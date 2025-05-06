package com.example.backend.dto;

import lombok.Data;

@Data
public class SavingsRecommendationDTO {
    public SavingsRecommendationDTO() {
    }

    public SavingsRecommendationDTO(Double recommendedAmount, Double percentage, String recommendationReason) {
        this.recommendedAmount = recommendedAmount;
        this.percentage = percentage;
        this.recommendationReason = recommendationReason;
    }

    public Double getRecommendedAmount() {
        return recommendedAmount;
    }

    public void setRecommendedAmount(Double recommendedAmount) {
        this.recommendedAmount = recommendedAmount;
    }

    public Double getPercentage() {
        return percentage;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }

    public String getRecommendationReason() {
        return recommendationReason;
    }

    public void setRecommendationReason(String recommendationReason) {
        this.recommendationReason = recommendationReason;
    }

    private Double recommendedAmount;
    private Double percentage;
    private String recommendationReason;
}