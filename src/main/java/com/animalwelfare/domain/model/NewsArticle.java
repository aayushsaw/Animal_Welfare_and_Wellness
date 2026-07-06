package com.animalwelfare.domain.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * NewsArticle entity — preserves the original welfare news content.
 *
 * The original Angular project had 8 news images (news1-8) shown in a carousel
 * with a single testimonial ticker. This entity models that content properly
 * so it can be managed via API and displayed in structured news sections.
 *
 * Features:
 * - featured flag for homepage carousel (mirrors original news images)
 * - category for filtering (WELFARE_NEWS, SUCCESS_STORY, CAMPAIGN, NGO_UPDATE)
 * - tags stored as comma-separated string (expandable to a join table later)
 * - imageUrl points to existing /assets/news/ images
 * - publishDate allows scheduling and ordering
 */
@Entity
@Table(name = "news_articles", indexes = {
    @Index(name = "idx_news_category",  columnList = "category"),
    @Index(name = "idx_news_published", columnList = "publish_date"),
    @Index(name = "idx_news_featured",  columnList = "featured")
})
public class NewsArticle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 500)
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(nullable = false, length = 50)
    private String category;  // WELFARE_NEWS, SUCCESS_STORY, CAMPAIGN, NGO_UPDATE

    @Column(name = "publish_date")
    private LocalDate publishDate;

    @Column(length = 100)
    private String author;

    @Column(length = 300)
    private String tags; // comma-separated: "rescue,adoption,dog"

    @Column(nullable = false)
    private boolean featured = false;

    @Column(nullable = false)
    private boolean published = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    // ---- Constructors ----
    public NewsArticle() {}

    // ---- Getters ----
    public Long getId()           { return id; }
    public String getTitle()      { return title; }
    public String getSummary()    { return summary; }
    public String getContent()    { return content; }
    public String getImageUrl()   { return imageUrl; }
    public String getCategory()   { return category; }
    public LocalDate getPublishDate() { return publishDate; }
    public String getAuthor()     { return author; }
    public String getTags()       { return tags; }
    public boolean isFeatured()   { return featured; }
    public boolean isPublished()  { return published; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public List<String> getTagList() {
        if (tags == null || tags.isBlank()) return new ArrayList<>();
        return Arrays.asList(tags.split(","));
    }

    // ---- Setters ----
    public void setId(Long id)                    { this.id = id; }
    public void setTitle(String title)            { this.title = title; }
    public void setSummary(String summary)        { this.summary = summary; }
    public void setContent(String content)        { this.content = content; }
    public void setImageUrl(String imageUrl)      { this.imageUrl = imageUrl; }
    public void setCategory(String category)      { this.category = category; }
    public void setPublishDate(LocalDate date)    { this.publishDate = date; }
    public void setAuthor(String author)          { this.author = author; }
    public void setTags(String tags)              { this.tags = tags; }
    public void setFeatured(boolean featured)     { this.featured = featured; }
    public void setPublished(boolean published)   { this.published = published; }
}
