package com.mythos.ponto.entity;
import jakarta.persistence.*; import java.time.LocalDateTime;
@Entity @Table(name="chat_messages") public class ChatMessage {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @ManyToOne(optional=false) private User user; @Column(nullable=false,length=4000) private String content; @Column(nullable=false) private LocalDateTime createdAt=LocalDateTime.now();
 protected ChatMessage() {} public ChatMessage(User u,String c){user=u;content=c;}
 public Long getId(){return id;} public User getUser(){return user;} public String getContent(){return content;} public LocalDateTime getCreatedAt(){return createdAt;}
}
