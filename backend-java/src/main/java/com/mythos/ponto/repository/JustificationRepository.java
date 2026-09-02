package com.mythos.ponto.repository;
import com.mythos.ponto.entity.Justification; import org.springframework.data.jpa.repository.JpaRepository; import java.util.List;
public interface JustificationRepository extends JpaRepository<Justification,Long> { List<Justification> findByUserIdOrderByDateDesc(Long userId); }
