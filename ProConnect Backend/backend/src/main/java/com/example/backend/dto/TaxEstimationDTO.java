package com.example.backend.dto;

import lombok.Data;

@Data
public class TaxEstimationDTO {
    private Double estimatedTax;
    private Double taxRate;
    private String taxYear;
    private Double taxableIncome;

    public TaxEstimationDTO() {
    }

    public TaxEstimationDTO(Double estimatedTax, Double taxRate, String taxYear, Double taxableIncome, Double deductions) {
        this.estimatedTax = estimatedTax;
        this.taxRate = taxRate;
        this.taxYear = taxYear;
        this.taxableIncome = taxableIncome;
        this.deductions = deductions;
    }

    public Double getEstimatedTax() {
        return estimatedTax;
    }

    public void setEstimatedTax(Double estimatedTax) {
        this.estimatedTax = estimatedTax;
    }

    public Double getTaxRate() {
        return taxRate;
    }

    public void setTaxRate(Double taxRate) {
        this.taxRate = taxRate;
    }

    public String getTaxYear() {
        return taxYear;
    }

    public void setTaxYear(String taxYear) {
        this.taxYear = taxYear;
    }

    public Double getTaxableIncome() {
        return taxableIncome;
    }

    public void setTaxableIncome(Double taxableIncome) {
        this.taxableIncome = taxableIncome;
    }

    public Double getDeductions() {
        return deductions;
    }

    public void setDeductions(Double deductions) {
        this.deductions = deductions;
    }

    private Double deductions;
}