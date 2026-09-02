package com.mythos.ponto.repository;
import com.mythos.ponto.entity.Report; import org.springframework.data.jpa.repository.JpaRepository; import java.util.List;
public interface ReportRepository extends JpaRepository<Report,Long> { List<Report> findAllByOrderByIdDesc(); }
