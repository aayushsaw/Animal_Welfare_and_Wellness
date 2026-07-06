package com.animalwelfare.api.response;

import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Paginated API response — wraps Spring's Page with a clean JSON contract.
 *
 * Response shape:
 * {
 *   "content": [...],
 *   "page": 0,
 *   "size": 10,
 *   "totalElements": 42,
 *   "totalPages": 5,
 *   "last": false
 * }
 */
public class PagedResponse<T> {

    private final List<T> content;
    private final int page;
    private final int size;
    private final long totalElements;
    private final int totalPages;
    private final boolean last;

    public PagedResponse(Page<T> pageData) {
        this.content       = pageData.getContent();
        this.page          = pageData.getNumber();
        this.size          = pageData.getSize();
        this.totalElements = pageData.getTotalElements();
        this.totalPages    = pageData.getTotalPages();
        this.last          = pageData.isLast();
    }

    public List<T> getContent()       { return content; }
    public int getPage()              { return page; }
    public int getSize()              { return size; }
    public long getTotalElements()    { return totalElements; }
    public int getTotalPages()        { return totalPages; }
    public boolean isLast()           { return last; }
}
