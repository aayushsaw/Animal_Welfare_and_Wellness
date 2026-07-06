package com.animalwelfare.api.dto.news;

import com.animalwelfare.domain.model.NewsArticle;

import java.time.LocalDate;
import java.util.List;

/** Response DTO for NewsArticle entity. */
public class NewsResponse {

    private Long id;
    private String title;
    private String summary;
    private String content;
    private String imageUrl;
    private String category;
    private LocalDate publishDate;
    private String author;
    private List<String> tags;
    private boolean featured;

    public static NewsResponse from(NewsArticle article) {
        NewsResponse r  = new NewsResponse();
        r.id            = article.getId();
        r.title         = article.getTitle();
        r.summary       = article.getSummary();
        r.content       = article.getContent();
        r.imageUrl      = article.getImageUrl();
        r.category      = article.getCategory();
        r.publishDate   = article.getPublishDate();
        r.author        = article.getAuthor();
        r.tags          = article.getTagList();
        r.featured      = article.isFeatured();
        return r;
    }

    // Getters
    public Long getId()           { return id; }
    public String getTitle()      { return title; }
    public String getSummary()    { return summary; }
    public String getContent()    { return content; }
    public String getImageUrl()   { return imageUrl; }
    public String getCategory()   { return category; }
    public LocalDate getPublishDate() { return publishDate; }
    public String getAuthor()     { return author; }
    public List<String> getTags() { return tags; }
    public boolean isFeatured()   { return featured; }
}
