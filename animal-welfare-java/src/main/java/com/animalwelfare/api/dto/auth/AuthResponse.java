package com.animalwelfare.api.dto.auth;

import java.util.Set;

/**
 * Authentication response — returned on login and token refresh.
 * Contains access token, refresh token, and basic user info.
 */
public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private Long userId;
    private String username;
    private String email;
    private String fullName;
    private Set<String> roles;

    // Getters
    public String getAccessToken()  { return accessToken; }
    public String getRefreshToken() { return refreshToken; }
    public String getTokenType()    { return tokenType; }
    public Long getUserId()         { return userId; }
    public String getUsername()     { return username; }
    public String getEmail()        { return email; }
    public String getFullName()     { return fullName; }
    public Set<String> getRoles()   { return roles; }

    // Setters
    public void setAccessToken(String v)  { this.accessToken = v; }
    public void setRefreshToken(String v) { this.refreshToken = v; }
    public void setUserId(Long v)         { this.userId = v; }
    public void setUsername(String v)     { this.username = v; }
    public void setEmail(String v)        { this.email = v; }
    public void setFullName(String v)     { this.fullName = v; }
    public void setRoles(Set<String> v)   { this.roles = v; }

    // Builder-style factory
    public static AuthResponse of(String accessToken, String refreshToken,
                                   Long userId, String username,
                                   String email, String fullName, Set<String> roles) {
        AuthResponse r = new AuthResponse();
        r.accessToken  = accessToken;
        r.refreshToken = refreshToken;
        r.userId       = userId;
        r.username     = username;
        r.email        = email;
        r.fullName     = fullName;
        r.roles        = roles;
        return r;
    }
}
