
package com.example.backend.service;

import com.example.backend.dto.*;
import com.example.backend.entity.*;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.FinancialSettingsRepository;
import com.example.backend.repository.FreelancerRepository;
import com.example.backend.repository.SavingsGoalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FreelancerFinanceService {

    private static final Map<String, Double> COUNTRY_TAX_RATES = new HashMap<>();
    static {
        COUNTRY_TAX_RATES.put("US", 0.25);
        COUNTRY_TAX_RATES.put("UK", 0.20);
        COUNTRY_TAX_RATES.put("CA", 0.23);
        COUNTRY_TAX_RATES.put("IN", 0.15);

    }

    @Autowired
    private FreelancerRepository freelancerRepository;

    @Autowired
    private FinancialSettingsRepository financialSettingsRepository;

    @Autowired
    private SavingsGoalRepository savingsGoalRepository;

    public TaxEstimationDTO calculateTaxEstimation(Long freelancerId) {
        Freelancer freelancer = freelancerRepository.findById(freelancerId)
                .orElseThrow(() -> new ResourceNotFoundException("Freelancer not found"));

        FinancialSettings settings = financialSettingsRepository.findByFreelancer(freelancer)
                .orElseGet(() -> createDefaultFinancialSettings(freelancer));

        double taxRate = settings.getTaxRate() != null ?
                settings.getTaxRate() :
                COUNTRY_TAX_RATES.getOrDefault(settings.getCountry(), 0.20);

        double estimatedTax = freelancer.getEarnings() * taxRate;

        TaxEstimationDTO dto = new TaxEstimationDTO();
        dto.setEstimatedTax(estimatedTax);
        dto.setTaxRate(taxRate * 100); // as percentage
        dto.setTaxableIncome(freelancer.getEarnings());
        dto.setTaxYear(String.valueOf(LocalDate.now().getYear()));

        return dto;
    }

    public SavingsRecommendationDTO getSavingsRecommendation(Long freelancerId) {
        Freelancer freelancer = freelancerRepository.findById(freelancerId)
                .orElseThrow(() -> new ResourceNotFoundException("Freelancer not found"));

        FinancialSettings settings = financialSettingsRepository.findByFreelancer(freelancer)
                .orElseGet(() -> createDefaultFinancialSettings(freelancer));

        double savingsPercentage = settings.getSavingsPercentage() != null ?
                settings.getSavingsPercentage() :
                0.20; // Default to 20%

        double recommendedAmount = freelancer.getEarnings() * savingsPercentage;

        SavingsRecommendationDTO dto = new SavingsRecommendationDTO();
        dto.setRecommendedAmount(recommendedAmount);
        dto.setPercentage(savingsPercentage * 100); // as percentage
        dto.setRecommendationReason("Based on your current earnings and savings preferences");

        return dto;
    }

    public SavingsGoal createSavingsGoal(Long freelancerId, SavingsGoalDTO goalDTO) {
        Freelancer freelancer = freelancerRepository.findById(freelancerId)
                .orElseThrow(() -> new ResourceNotFoundException("Freelancer not found"));

        SavingsGoal goal = new SavingsGoal();
        goal.setFreelancer(freelancer);
        goal.setName(goalDTO.getName());
        goal.setDescription(goalDTO.getDescription());
        goal.setTargetAmount(goalDTO.getTargetAmount());
        goal.setCurrentAmount(0.0);
        goal.setTargetDate(goalDTO.getTargetDate());
        goal.setCompleted(false);

        return savingsGoalRepository.save(goal);
    }

    public SavingsGoal updateSavingsGoalProgress(Long goalId, Double amountAdded) {
        SavingsGoal goal = savingsGoalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Savings goal not found"));

        double newAmount = goal.getCurrentAmount() + amountAdded;
        goal.setCurrentAmount(newAmount);

        if (newAmount >= goal.getTargetAmount()) {
            goal.setCompleted(true);
        }

        return savingsGoalRepository.save(goal);
    }

    public List<SavingsGoal> getFreelancerSavingsGoals(Long freelancerId) {
        return savingsGoalRepository.findByFreelancerId(freelancerId);
    }

    public FinancialSettings updateFinancialSettings(Long freelancerId, FinancialSettings newSettings) {
        Freelancer freelancer = freelancerRepository.findById(freelancerId)
                .orElseThrow(() -> new ResourceNotFoundException("Freelancer not found"));

        FinancialSettings settings = financialSettingsRepository.findByFreelancer(freelancer)
                .orElseGet(() -> createDefaultFinancialSettings(freelancer));

        if (newSettings.getCountry() != null) {
            settings.setCountry(newSettings.getCountry());
            // Update tax rate based on country if not explicitly set
            if (newSettings.getTaxRate() == null) {
                settings.setTaxRate(COUNTRY_TAX_RATES.getOrDefault(newSettings.getCountry(), 0.20));
            }
        }

        if (newSettings.getTaxRate() != null) {
            settings.setTaxRate(newSettings.getTaxRate());
        }

        if (newSettings.getSavingsPercentage() != null) {
            settings.setSavingsPercentage(newSettings.getSavingsPercentage());
        }

        if (newSettings.getCurrency() != null) {
            settings.setCurrency(newSettings.getCurrency());
        }

        return financialSettingsRepository.save(settings);
    }

    private FinancialSettings createDefaultFinancialSettings(Freelancer freelancer) {
        FinancialSettings settings = new FinancialSettings();
        settings.setFreelancer(freelancer);
        settings.setCountry("US"); // Default country
        settings.setCurrency("USD");
        settings.setTaxRate(COUNTRY_TAX_RATES.get("US"));
        settings.setSavingsPercentage(0.20); // 20% default savings rate
        return financialSettingsRepository.save(settings);
    }

    public Map<String, Object> getFinancialDashboard(Long freelancerId) {
        Freelancer freelancer = freelancerRepository.findById(freelancerId)
                .orElseThrow(() -> new ResourceNotFoundException("Freelancer not found"));

        TaxEstimationDTO taxEstimation = calculateTaxEstimation(freelancerId);
        SavingsRecommendationDTO savingsRecommendation = getSavingsRecommendation(freelancerId);
        List<SavingsGoal> goals = getFreelancerSavingsGoals(freelancerId);

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("earnings", freelancer.getEarnings());
        dashboard.put("taxEstimation", taxEstimation);
        dashboard.put("savingsRecommendation", savingsRecommendation);
        dashboard.put("savingsGoals", goals);

        // Calculate progress for each goal
        goals.forEach(goal -> {
            double progress = (goal.getCurrentAmount() / goal.getTargetAmount()) * 100;
            long daysRemaining = ChronoUnit.DAYS.between(LocalDate.now(), goal.getTargetDate());
            dashboard.put("goalProgress_" + goal.getId(), Map.of(
                    "progress", progress,
                    "daysRemaining", daysRemaining
            ));
        });

        return dashboard;
    }
}