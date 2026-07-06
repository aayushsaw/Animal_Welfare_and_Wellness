package com.animalwelfare.domain.repository;

import com.animalwelfare.domain.model.NewsArticle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NewsArticleRepository extends JpaRepository<NewsArticle, Long> {

    Page<NewsArticle> findByPublishedTrueOrderByPublishDateDesc(Pageable pageable);

    List<NewsArticle> findByFeaturedTrueAndPublishedTrueOrderByPublishDateDesc();

    Page<NewsArticle> findByCategoryAndPublishedTrue(String category, Pageable pageable);
}
