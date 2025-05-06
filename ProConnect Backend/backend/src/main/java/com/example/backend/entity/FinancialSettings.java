package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class FinancialSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    public Long getId() {
        return id;
    }

    public FinancialSettings(Long id, Freelancer freelancer, String country, String currency, Double taxRate, Double savingsPercentage) {
        this.id = id;
        this.freelancer = freelancer;
        this.country = country;
        this.currency = currency;
        this.taxRate = taxRate;
        this.savingsPercentage = savingsPercentage;
    }

    public FinancialSettings() {
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Freelancer getFreelancer() {
        return freelancer;
    }

    public void setFreelancer(Freelancer freelancer) {
        this.freelancer = freelancer;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public Double getTaxRate() {
        return taxRate;
    }

    public void setTaxRate(Double taxRate) {
        this.taxRate = taxRate;
    }

    public Double getSavingsPercentage() {
        return savingsPercentage;
    }

    public void setSavingsPercentage(Double savingsPercentage) {
        this.savingsPercentage = savingsPercentage;
    }

    @OneToOne
    @JoinColumn(name = "freelancer_id", unique = true)
    private Freelancer freelancer;

    private String country; // For tax calculation
    private String currency;
    private Double taxRate; // Can be auto-calculated based on country
    private Double savingsPercentage; // User's preferred savings rate
}
