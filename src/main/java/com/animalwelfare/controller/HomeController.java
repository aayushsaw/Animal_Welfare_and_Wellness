package com.animalwelfare.controller;

import com.animalwelfare.service.AnimalService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequiredArgsConstructor
public class HomeController {

    private final AnimalService animalService;

    @GetMapping({"/", "/home"})
    public String home(Model model) {
        model.addAttribute("totalAvailable", animalService.countAvailable());
        model.addAttribute("totalAdopted",   animalService.countAdopted());
        return "home";
    }

    @GetMapping("/about")
    public String about() {
        return "about";
    }
}
