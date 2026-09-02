package com.mythos.ponto.entity;
import jakarta.persistence.*;
@Entity @Table(name="reports") public class Report {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @Column(nullable=false) private String title; @Column(nullable=false,length=4000) private String description; private String category; @Column(nullable=false) private String status="OPEN"; @ManyToOne(optional=false) private User author;
 protected Report() {} public Report(String t,String d,String c,User a){title=t;description=d;category=c;author=a;}
 public Long getId(){return id;} public String getTitle(){return title;} public String getDescription(){return description;} public String getCategory(){return category;} public String getStatus(){return status;} public User getAuthor(){return author;}
}
