package com.example.backend.service;

import com.example.backend.entity.Rating;
import com.example.backend.repository.RatingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class RatingService {
    @Autowired
    private RatingRepository ratingRepository;

    public Rating saveRating(Rating rating) {
        return ratingRepository.save(rating);
    }

    public List<Rating> getRatingsByFreelancerId(Long freelancerId) {
        return ratingRepository.findByFreelancerId(freelancerId);
    }

    public Double getAverageRating(Long freelancerId) {
        return ratingRepository.findAverageRatingByFreelancerId(freelancerId);
    }

    public Long getTotalRatings(Long freelancerId) {
        return ratingRepository.countByFreelancerId(freelancerId);
    }

    public boolean hasClientRatedFreelancerForProject(Long freelancerId, Long clientId, Long projectId) {
        Optional<Rating> rating = ratingRepository.findByFreelancerIdAndClientIdAndProjectId(
                freelancerId, clientId, projectId
        );
        return rating.isPresent();
    }

    public Map<String, Object> getFreelancerRatingStats(Long freelancerId) {
        Map<String, Object> stats = new HashMap<>();
        Double averageRating = getAverageRating(freelancerId);
        Long totalRatings = getTotalRatings(freelancerId);

        stats.put("averageRating", averageRating != null ? averageRating : 0.0);
        stats.put("totalRatings", totalRatings != null ? totalRatings : 0);

        return stats;
    }


}