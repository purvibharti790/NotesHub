package com.noteshub.controller;

import com.noteshub.entity.User;
import com.noteshub.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    /**
     * POST /api/auth/register
     * Register a new student or contributor.
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        String email = request.get("email");
        String password = request.get("password");
        String role = request.getOrDefault("role", "ROLE_STUDENT");

        try {
            User registered = userService.registerUser(name, email, password, role);

            Map<String, Object> response = new HashMap<>();
            response.put("id", registered.getId());
            response.put("name", registered.getName());
            response.put("email", registered.getEmail());
            response.put("role", registered.getRole());
            response.put("message", "Registration successful!");

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }

    /**
     * POST /api/auth/login
     * Authenticate student and establish active session.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required."));
        }

        Optional<User> opt = userService.authenticate(email, password);
        if (opt.isPresent()) {
            User user = opt.get();
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("name", user.getName());
            response.put("email", user.getEmail());
            response.put("role", user.getRole());
            response.put("message", "Login successful!");
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid email or password credentials."));
        }
    }

    /**
     * GET /api/auth/user
     * Fetch user profile by email query param.
     */
    @GetMapping("/user")
    public ResponseEntity<?> getUser(@RequestParam String email) {
        return userService.findByEmail(email)
                .map(user -> {
                    Map<String, Object> res = new HashMap<>();
                    res.put("id", user.getId());
                    res.put("name", user.getName());
                    res.put("email", user.getEmail());
                    res.put("role", user.getRole());
                    return ResponseEntity.ok(res);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
