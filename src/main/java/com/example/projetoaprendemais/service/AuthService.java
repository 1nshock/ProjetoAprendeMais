package com.example.projetoaprendemais.service;

import com.example.projetoaprendemais.model.User;
import com.example.projetoaprendemais.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class AuthService {
    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User authenticate(String username, String password) {
        return userRepository.findByUsername(username)
                .filter(u -> u.getPassword().equals(password))
                .orElse(null);
    }

    public User register(String username, String password, String tipo) {
        // Verificar se usuário já existe
        Optional<User> existing = userRepository.findByUsername(username);
        if (existing.isPresent()) {
            return null; // Usuário já existe
        }

        // Criar novo usuário
        User newUser = new User();
        newUser.setUsername(username);
        newUser.setPassword(password); // TODO: hash password com BCrypt em produção
        newUser.setTipo(tipo != null ? tipo : "aluno");
        return userRepository.save(newUser);
    }
}
