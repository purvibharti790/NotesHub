package com.noteshub.service;

import com.noteshub.entity.User;
import com.noteshub.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(String name, String email, String rawPassword, String role) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Email is required.");
        }
        if (rawPassword == null || rawPassword.length() < 4) {
            throw new IllegalArgumentException("Password must be at least 4 characters.");
        }
        if (userRepository.existsByEmail(email.trim().toLowerCase())) {
            throw new IllegalArgumentException("An account with email '" + email + "' already exists.");
        }

        String encodedPassword = passwordEncoder.encode(rawPassword);
        User user = new User(
                name != null ? name.trim() : "Student",
                email.trim().toLowerCase(),
                encodedPassword,
                (role != null && !role.isBlank()) ? role : "ROLE_STUDENT"
        );
        return userRepository.save(user);
    }

    public Optional<User> authenticate(String email, String rawPassword) {
        if (email == null || rawPassword == null) return Optional.empty();
        Optional<User> opt = userRepository.findByEmail(email.trim().toLowerCase());
        if (opt.isPresent() && passwordEncoder.matches(rawPassword, opt.get().getPassword())) {
            return opt;
        }
        return Optional.empty();
    }

    public Optional<User> findByEmail(String email) {
        if (email == null) return Optional.empty();
        return userRepository.findByEmail(email.trim().toLowerCase());
    }
}
