package com.example.backend.service;



import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.backend.dto.AuthResponseDTO;
import com.example.backend.dto.ClientLoginDTO;
import com.example.backend.dto.ClientSignupDTO;
import com.example.backend.entity.Client;
import com.example.backend.repository.ClientRepository;
import com.example.backend.security.JwtUtil;

@Service
public class AuthService {

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthResponseDTO signup(ClientSignupDTO signupDTO) {
        // Check if email already exists
        if (clientRepository.existsByEmail(signupDTO.getEmail())) {
            return  new AuthResponseDTO(null, "Email already registered", false);
        }

        // Create new client
        Client client = new Client();
        client.setName(signupDTO.getName());
        client.setEmail(signupDTO.getEmail());
        client.setPassword(passwordEncoder.encode(signupDTO.getPassword()));

        clientRepository.save(client);

        // Generate JWT token
        String token = jwtUtil.generateToken(client.getEmail());

        return new AuthResponseDTO(token, "Signup successful", true);
    }

    public Client findByEmail(String email) {
        return clientRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Client not found"));
    }

    public AuthResponseDTO login(ClientLoginDTO loginDTO) {
        // Find client by email
        Optional<Client> optionalClient = clientRepository.findByEmail(loginDTO.getEmail());

        if (optionalClient.isEmpty()) {
            return new AuthResponseDTO(null, "Invalid email or password", false);
        }

        Client client = optionalClient.get();

        // Check password
        if (!passwordEncoder.matches(loginDTO.getPassword(), client.getPassword())) {
            return new AuthResponseDTO(null, "Invalid email or password", false);
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(client.getEmail());

        return new AuthResponseDTO(token, "Login successful", true);
    }
}