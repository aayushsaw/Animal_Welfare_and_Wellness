package com.animalwelfare.service;

import com.animalwelfare.api.dto.news.NewsResponse;
import com.animalwelfare.api.response.PagedResponse;
import com.animalwelfare.domain.repository.NewsArticleRepository;
import com.animalwelfare.exception.ResourceNotFoundException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * NewsService — serves the welfare news and awareness content.
 *
 * Content sourced from original project assets (news1-8 images)
 * seeded via Flyway V5. Preserves Pyaar Foundation testimonial
 * and all original news imagery.
 */
@Service
public class NewsService {

    private final NewsArticleRepository newsRepository;

    public NewsService(NewsArticleRepository newsRepository) {
        this.newsRepository = newsRepository;
    }

    /** Paginated list of published articles, newest first. */
    @Transactional(readOnly = true)
    public PagedResponse<NewsResponse> getPublishedArticles(int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("publishDate").descending());
        var articles = newsRepository.findByPublishedTrueOrderByPublishDateDesc(pageable);
        return new PagedResponse<>(articles.map(NewsResponse::from));
    }

    /** Featured articles for homepage carousel — maps to original news1-8 images. */
    @Transactional(readOnly = true)
    public List<NewsResponse> getFeaturedArticles() {
        return newsRepository.findByFeaturedTrueAndPublishedTrueOrderByPublishDateDesc()
                .stream()
                .map(NewsResponse::from)
                .collect(Collectors.toList());
    }

    /** Single article by ID. */
    @Transactional(readOnly = true)
    public NewsResponse getById(Long id) {
        return newsRepository.findById(id)
                .map(NewsResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Article", id));
    }

    /** Filter by category: WELFARE_NEWS, SUCCESS_STORY, CAMPAIGN, NGO_UPDATE. */
    @Transactional(readOnly = true)
    public PagedResponse<NewsResponse> getByCategory(String category, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("publishDate").descending());
        var articles = newsRepository.findByCategoryAndPublishedTrue(
                category.toUpperCase(), pageable);
        return new PagedResponse<>(articles.map(NewsResponse::from));
    }
}
