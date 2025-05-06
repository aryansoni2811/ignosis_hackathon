package com.example.backend.repository;

import com.example.backend.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Check if any payment exists for a proposal (regardless of status)
    boolean existsByProposalId(Long proposalId);

    // Find payment by Stripe payment intent ID
    Optional<Payment> findByStripePaymentIntentId(String paymentIntentId);

    // Check if a payment exists for a proposal with specific status (corrected version)
    boolean existsByProposalIdAndStatus(Long proposalId, String status);

    // Find payment by proposal ID and status
    Optional<Payment> findByProposalIdAndStatus(Long proposalId, String status);

    // Find all successful payments for a freelancer
    @Query("SELECT p FROM Payment p WHERE p.freelancer.id = :freelancerId AND p.status = 'succeeded'")
    List<Payment> findSuccessfulPaymentsByFreelancerId(@Param("freelancerId") Long freelancerId);

    // Alternative way to check if any payment exists for a proposal
    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM Payment p WHERE p.proposal.id = :proposalId")
    boolean existsAnyPaymentForProposal(@Param("proposalId") Long proposalId);
}