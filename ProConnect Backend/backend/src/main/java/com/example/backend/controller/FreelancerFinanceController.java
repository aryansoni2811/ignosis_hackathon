
package com.example.backend.controller;

import com.example.backend.dto.*;
import com.example.backend.entity.FinancialSettings;
import com.example.backend.service.FreelancerFinanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/freelancer/finance")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class FreelancerFinanceController {

    @Autowired
    private FreelancerFinanceService financeService;

    @GetMapping("/tax-estimation/{freelancerId}")
    public ResponseEntity<TaxEstimationDTO> getTaxEstimation(@PathVariable Long freelancerId) {
        return ResponseEntity.ok(financeService.calculateTaxEstimation(freelancerId));
    }

    @GetMapping("/savings-recommendation/{freelancerId}")
    public ResponseEntity<SavingsRecommendationDTO> getSavingsRecommendation(@PathVariable Long freelancerId) {
        return ResponseEntity.ok(financeService.getSavingsRecommendation(freelancerId));
    }

    @PostMapping("/savings-goals/{freelancerId}")
    public ResponseEntity<?> createSavingsGoal(
            @PathVariable Long freelancerId,
            @RequestBody SavingsGoalDTO goalDTO) {
        return ResponseEntity.ok(financeService.createSavingsGoal(freelancerId, goalDTO));
    }

    @PutMapping("/savings-goals/{goalId}/add")
    public ResponseEntity<?> addToSavingsGoal(
            @PathVariable Long goalId,
            @RequestParam Double amount) {
        return ResponseEntity.ok(financeService.updateSavingsGoalProgress(goalId, amount));
    }

    @GetMapping("/savings-goals/{freelancerId}")
    public ResponseEntity<?> getSavingsGoals(@PathVariable Long freelancerId) {
        return ResponseEntity.ok(financeService.getFreelancerSavingsGoals(freelancerId));
    }

    @PutMapping("/financial-settings/{freelancerId}")
    public ResponseEntity<FinancialSettings> updateFinancialSettings(
            @PathVariable Long freelancerId,
            @RequestBody FinancialSettings newSettings) {
        return ResponseEntity.ok(financeService.updateFinancialSettings(freelancerId, newSettings));
    }

    @GetMapping("/dashboard/{freelancerId}")
    public ResponseEntity<Map<String, Object>> getFinancialDashboard(@PathVariable Long freelancerId) {
        return ResponseEntity.ok(financeService.getFinancialDashboard(freelancerId));
    }
}