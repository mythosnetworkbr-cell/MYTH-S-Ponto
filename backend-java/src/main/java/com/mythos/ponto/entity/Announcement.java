package com.mythos.ponto.entity;
import jakarta.persistence.*; import java.time.LocalDateTime;
@Entity @Table(name="announcements") public class Announcement {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @Column(nullable=false) private String title; @Column(nullable=false,length=4000) private String message; @ManyToOne(optional=false) private User author; @Column(nullable=false) private LocalDateTime createdAt=LocalDateTime.now();
 protected Announcement() {} public Announcement(String t,String m,User a){title=t;message=m;author=a;}
 public Long getId(){return id;} public String getTitle(){return title;} public String getMessage(){return message;} public User getAuthor(){return author;} public LocalDateTime getCreatedAt(){return createdAt;}
}
