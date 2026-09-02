package com.mythos.ponto;

import com.mythos.ponto.entity.User;
import com.mythos.ponto.entity.Notice;
import com.mythos.ponto.repository.UserRepository;
import com.mythos.ponto.repository.NoticeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class Application {
    public static void main(String[] args) { SpringApplication.run(Application.class, args); }

    @Bean
    CommandLineRunner seed(UserRepository users, NoticeRepository notices) {
        return args -> {
            String email = System.getenv().getOrDefault("MYTHOS_OWNER_EMAIL", "owner@mythos.local");
            if (users.findByEmail(email).isEmpty()) {
                users.save(new User("Owner", "owner", email, "Owner"));
            }
            if (notices.count() == 0) {
                notices.save(new Notice("Sistema iniciado", "API do MYTHØS Ponto disponível.", "SYSTEM", "INFO"));
            }
        };
    }
}
