package com.example.backend.controller;

import com.example.backend.entity.Freelancer;
import com.example.backend.entity.Project;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.FreelancerRepository;
import com.example.backend.repository.ProjectRepository;
import com.example.backend.repository.SkillRepository;
import com.example.backend.service.FreeLancerAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.backend.dto.AuthResponseDTO;
import com.example.backend.dto.FreelancerLoginDTO;
import com.example.backend.dto.FreelancerSignupDTO;

import com.example.backend.entity.Skill;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth/freelancer")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class FreelancerAuthController {

    @Autowired
    private FreeLancerAuthService authService;

    @Autowired
    private FreelancerRepository freelancerRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private ProjectRepository projectRepository;

    // Fix: Properly initialize the logger
    private static final Logger logger = Logger.getLogger(FreelancerAuthController.class.getName());

    @PostMapping("/signup")
    public ResponseEntity<AuthResponseDTO> freelancerSignup(@RequestBody FreelancerSignupDTO signupDTO) {
        try {
            AuthResponseDTO response = authService.freelancerSignup(signupDTO);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new AuthResponseDTO(null, "Error during signup: " + e.getMessage(), false));
        }
    }

    @GetMapping("/freelancer")
    public ResponseEntity<?> getFreelancerByEmail(@RequestParam String email) {
        try {
            Freelancer freelancer = authService.findFreelancerByEmail(email);
            if (freelancer == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Freelancer not found");
            }
            return ResponseEntity.ok(freelancer);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching freelancer: " + e.getMessage());
        }
    }

    @PostMapping("/upload-profile-image")
    public ResponseEntity<?> uploadProfileImage(
            @RequestParam("email") String email,
            @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Please select a file to upload");
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body("Only image files are allowed");
            }

            // Update freelancer's profile image
            Freelancer freelancer = freelancerRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Freelancer not found"));

            freelancer.setProfileImage(file.getBytes());
            freelancer.setProfileImageContentType(contentType);
            freelancerRepository.save(freelancer);

            return ResponseEntity.ok(Map.of(
                    "message", "Profile image uploaded successfully",
                    "contentType", contentType
            ));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload file: " + e.getMessage());
        }
    }

    @GetMapping("/profile-image/{email}")
    public ResponseEntity<byte[]> getProfileImage(@PathVariable String email) {
        try {
            Freelancer freelancer = freelancerRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Freelancer not found"));

            if (freelancer.getProfileImage() == null) {
                return ResponseEntity.notFound().build();
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(freelancer.getProfileImageContentType()));
            headers.setCacheControl("max-age=3600");

            return new ResponseEntity<>(freelancer.getProfileImage(), headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> freelancerLogin(@RequestBody FreelancerLoginDTO loginDTO) {
        try {
            AuthResponseDTO response = authService.freelancerLogin(loginDTO);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new AuthResponseDTO(null, "Error during login: " + e.getMessage(), false));
        }
    }

    @GetMapping("/{freelancerId}/skills")
    public ResponseEntity<List<Skill>> getFreelancerSkills(@PathVariable Long freelancerId) {
        try {
            List<Skill> skills = authService.getFreelancerSkills(freelancerId);
            return ResponseEntity.ok(skills);
        } catch (Exception e) {
            logger.severe("Error getting freelancer skills: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/{freelancerId}/skills")
    public ResponseEntity<Skill> addSkill(
            @PathVariable Long freelancerId,
            @RequestParam String name,
            @RequestParam String proficiency) {
        try {
            Skill skill = authService.addSkillToFreelancer(freelancerId, name, proficiency);
            return ResponseEntity.ok(skill);
        } catch (Exception e) {
            logger.severe("Error adding skill: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{freelancerId}/skills/{skillId}")
    public ResponseEntity<Void> removeSkill(
            @PathVariable Long freelancerId,
            @PathVariable Long skillId) {
        try {
            authService.removeSkillFromFreelancer(freelancerId, skillId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.severe("Error removing skill: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // FreelancerAuthController.java
    @GetMapping("/earnings")
    public ResponseEntity<Map<String, Object>> getFreelancerEarnings(@RequestParam Long id) {
        Freelancer freelancer = freelancerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Freelancer not found"));

        // Get completed projects
        List<Project> completedProjects = projectRepository.findCompletedProjectsByFreelancerId(id);

        // Calculate monthly earnings
        Map<String, Double> monthlyEarnings = completedProjects.stream()
                .filter(p -> p.getCompletedAt() != null)
                .collect(Collectors.groupingBy(
                        p -> p.getCompletedAt().getMonth().toString() + "-" + p.getCompletedAt().getYear(),
                        Collectors.summingDouble(Project::getBudget)
                ));

        // Calculate trend (simplified)
        double trend = 0;
        if (monthlyEarnings.size() > 1) {
            List<Double> values = new ArrayList<>(monthlyEarnings.values());
            double lastMonth = values.get(values.size() - 1);
            double prevMonth = values.get(values.size() - 2);
            trend = ((lastMonth - prevMonth) / prevMonth) * 100;
        }

        // Prepare response
        Map<String, Object> response = new HashMap<>();
        response.put("totalEarnings", freelancer.getEarnings());
        response.put("monthlyEarnings", monthlyEarnings.entrySet().stream()
                .map(e -> {
                    String[] parts = e.getKey().split("-");
                    return Map.of(
                            "month", parts[0],
                            "year", parts[1],
                            "amount", e.getValue()
                    );
                })
                .collect(Collectors.toList()));
        response.put("trend", trend);
        response.put("recentTransactions", completedProjects.stream()
                .sorted(Comparator.comparing(Project::getCompletedAt).reversed())
                .limit(5)
                .map(p -> Map.of(
                        "project", p.getTitle(),
                        "client", p.getClient().getName(),
                        "amount", p.getBudget(),
                        "date", p.getCompletedAt()
                ))
                .collect(Collectors.toList()));

        return ResponseEntity.ok(response);
    }



    @GetMapping("/all")
    public ResponseEntity<?> getAllFreelancers() {
        try {
            List<Freelancer> freelancers = freelancerRepository.findAll();

            // Eagerly load skills for each freelancer
            for (Freelancer freelancer : freelancers) {
                freelancer.setSkills(skillRepository.findByFreelancerId(freelancer.getId()));
            }

            return ResponseEntity.ok(freelancers);
        } catch (Exception e) {
            logger.severe("Error fetching all freelancers: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching freelancers: " + e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchFreelancersBySkill(@RequestParam String skill) {
        logger.info("Searching freelancers with skill: " + skill);
        try {
            if (skill == null || skill.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Skill parameter cannot be empty");
            }

            List<Freelancer> freelancers = authService.findFreelancersBySkill(skill);
            logger.info("Found " + freelancers.size() + " freelancers with skill: " + skill);
            return ResponseEntity.ok(freelancers);
        } catch (Exception e) {
            logger.severe("Error searching freelancers by skill: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error searching freelancers: " + e.getMessage());
        }
    }
}