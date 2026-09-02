package com.mythos.ponto.entity;

import jakarta.persistence.*;

@Entity
@Table(name="users")
public class User {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private String name;
    @Column(nullable=false, unique=true) private String username;
    @Column(nullable=false, unique=true) private String email;
    @Column(nullable=false) private String role;
    protected User() {}
    public User(String name,String username,String email,String role){this.name=name;this.username=username;this.email=email;this.role=role;}
    public Long getId(){return id;} public String getName(){return name;} public String getUsername(){return username;} public String getEmail(){return email;} public String getRole(){return role;}
}
