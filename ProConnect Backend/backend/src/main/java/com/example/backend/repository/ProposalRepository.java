package com.example.backend.repository;

import com.example.backend.entity.Proposal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

public interface ProposalRepository extends JpaRepository<Proposal, Long> {
    List<Proposal> findByProjectId(Long projectId);

    List<Proposal> findByFreelancerIdAndStatus(Long freelancerId, String status);
    List<Proposal> findByFreelancerId(Long freelancerId);
    boolean existsByFreelancerIdAndProjectId(Long freelancerId, Long projectId);
    boolean existsByProjectIdAndStatus(Long projectId, String status);

    @Query("SELECT p FROM Proposal p WHERE p.id = :id AND p.status = 'Accepted'")
    Optional<Proposal> findAcceptedProposalById(@Param("id") Long id);

    @Transactional
    @Modifying
    @Query("UPDATE Proposal p SET p.status = 'Rejected', p.reviewedAt = CURRENT_TIMESTAMP " +
            "WHERE p.project.id = :projectId AND p.id != :acceptedProposalId AND p.status = 'Pending'")
    void rejectOtherProposals(@Param("projectId") Long projectId,
                              @Param("acceptedProposalId") Long acceptedProposalId);
}