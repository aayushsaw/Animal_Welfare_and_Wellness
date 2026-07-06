package com.animalwelfare.api.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;

/**
 * Consistent API response wrapper for all endpoints.
 *
 * Every API response follows this contract:
 * {
 *   "success": true,
 *   "message": "Animal created successfully",
 *   "data": { ... },
 *   "timestamp": "2024-01-01T10:00:00"
 * }
 *
 * Uses static factory methods for clean call sites:
 *   ApiResponse.success("Done", payload)
 *   ApiResponse.error("Not found")
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final boolean success;
    private final String message;
    private final T data;
    private final LocalDateTime timestamp;

    private ApiResponse(boolean success, String message, T data) {
        this.success   = success;
        this.message   = message;
        this.data      = data;
        this.timestamp = LocalDateTime.now();
    }

    // ---- Factory methods ----

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, "Success", data);
    }

    public static ApiResponse<Void> success(String message) {
        return new ApiResponse<>(true, message, null);
    }

    public static ApiResponse<Void> error(String message) {
        return new ApiResponse<>(false, message, null);
    }

    public static <T> ApiResponse<T> error(String message, T data) {
        return new ApiResponse<>(false, message, data);
    }

    // ---- Getters ----
    public boolean isSuccess()         { return success; }
    public String getMessage()         { return message; }
    public T getData()                 { return data; }
    public LocalDateTime getTimestamp(){ return timestamp; }
}
