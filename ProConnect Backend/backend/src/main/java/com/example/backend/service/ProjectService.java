package com.example.backend.service;

import com.example.backend.dto.ProjectDTO;
import com.example.backend.dto.ProjectDTO;
import com.example.backend.entity.Client;
import com.example.backend.entity.Project;
import com.example.backend.repository.ClientRepository;
import com.example.backend.repository.ProjectRepository;
import com.example.backend.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ClientRepository clientRepository;

    public List<ProjectDTO> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ProjectDTO> getProjectsByClient(String clientEmail) {
        Client client = clientRepository.findByEmail(clientEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with email: " + clientEmail));

        return projectRepository.findByClientOrderByCreatedAtDesc(client).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public ProjectDTO getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        return convertToDto(project);
    }

    public List<ProjectDTO> getProjectsByFreelancer(Long freelancerId) {
        List<Project> projects = projectRepository.findByFreelancerId(freelancerId);
        return projects.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    public ProjectDTO completeProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (!"In Progress".equals(project.getStatus())) {
            throw new IllegalStateException("Only projects in progress can be completed");
        }

        project.setStatus("Completed");
        project.setCompletedAt(LocalDateTime.now());
        Project savedProject = projectRepository.save(project);

        return convertToDto(savedProject);
    }

    @Transactional
    public ProjectDTO createProject(ProjectDTO projectDto) {
        Client client = clientRepository.findByEmail(projectDto.getClientEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with email: " + projectDto.getClientEmail()));

        Project project = new Project();
        project.setTitle(projectDto.getTitle());
        project.setDescription(projectDto.getDescription());
        project.setBudget(projectDto.getBudget());
        project.setDeadline(projectDto.getDeadline());
        project.setRequiredSkills(projectDto.getRequiredSkills());
        project.setStatus("Open"); // Default status for new projects
        project.setClient(client);

        Project savedProject = projectRepository.save(project);
        return convertToDto(savedProject);
    }

    @Transactional
    public ProjectDTO updateProject(Long id, ProjectDTO projectDto) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        project.setTitle(projectDto.getTitle());
        project.setDescription(projectDto.getDescription());
        project.setBudget(projectDto.getBudget());
        project.setDeadline(projectDto.getDeadline());
        project.setRequiredSkills(projectDto.getRequiredSkills());

        if (projectDto.getStatus() != null) {
            project.setStatus(projectDto.getStatus());
        }

        Project updatedProject = projectRepository.save(project);
        return convertToDto(updatedProject);
    }

    @Transactional
    public void deleteProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        projectRepository.delete(project);
    }

    public List<ProjectDTO> searchProjectsBySkills(String skills) {
        return projectRepository.findByRequiredSkillsContainingIgnoreCase(skills).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private ProjectDTO convertToDto(Project project) {
        ProjectDTO dto = new ProjectDTO();
        dto.setId(project.getId());
        dto.setTitle(project.getTitle());
        dto.setDescription(project.getDescription());
        dto.setBudget(project.getBudget());
        dto.setDeadline(project.getDeadline());
        dto.setRequiredSkills(project.getRequiredSkills());
        dto.setStatus(project.getStatus());
        dto.setClientEmail(project.getClient().getEmail());
        return dto;
    }
}
