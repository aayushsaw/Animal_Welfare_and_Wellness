package com.animalwelfare.controller;

import com.animalwelfare.service.AnimalService;
import com.animalwelfare.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(HomeController.class)
class HomeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AnimalService animalService;

    @MockBean
    private UserService userService;

    @Test
    void homePage_returnsOkWithStats() throws Exception {
        when(animalService.countAvailable()).thenReturn(5L);
        when(animalService.countAdopted()).thenReturn(3L);

        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(view().name("home"))
                .andExpect(model().attribute("totalAvailable", 5L))
                .andExpect(model().attribute("totalAdopted", 3L));
    }

    @Test
    void aboutPage_returnsOk() throws Exception {
        mockMvc.perform(get("/about"))
                .andExpect(status().isOk())
                .andExpect(view().name("about"));
    }
}
