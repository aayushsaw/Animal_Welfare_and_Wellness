package com.animalwelfare.api.controller;

import com.animalwelfare.api.dto.news.NewsResponse;
import com.animalwelfare.api.response.ApiResponse;
import com.animalwelfare.api.response.PagedResponse;
import com.animalwelfare.service.NewsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * News API — /api/v1/news
 *
 * All public — no auth required.
 * Content seeded from original project assets (news1-8 images).
 *
 *   GET /featured   — featured articles for homepage carousel
 *   GET /           — paginated list of all published articles
 *   GET /{id}       — single article
 *   GET /category/{cat} — articles by category
 */
@Tag(name = "News & Welfare Content", description = "Animal welfare news, campaigns and success stories")
@RestController
@RequestMapping("/api/v1/news")
public class NewsApiController {

    private final NewsService newsService;

    public NewsApiController(NewsService newsService) {
        this.newsService = newsService;
    }

    @Operation(summary = "Get featured articles for the homepage carousel")
    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<NewsResponse>>> getFeatured() {
        return ResponseEntity.ok(ApiResponse.success(newsService.getFeaturedArticles()));
    }

    @Operation(summary = "Get paginated list of all published news articles")
    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<NewsResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size) {
        return ResponseEntity.ok(ApiResponse.success(newsService.getPublishedArticles(page, size)));
    }

    @Operation(summary = "Get a single news article by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NewsResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(newsService.getById(id)));
    }

    @Operation(summary = "Get articles by category: WELFARE_NEWS, SUCCESS_STORY, CAMPAIGN, NGO_UPDATE")
    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<PagedResponse<NewsResponse>>> getByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size) {
        return ResponseEntity.ok(ApiResponse.success(newsService.getByCategory(category, page, size)));
    }
}
