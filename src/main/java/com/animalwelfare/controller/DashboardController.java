package com.animalwelfare.controller;

import com.animalwelfare.model.User;
import com.animalwelfare.service.AnimalService;
import com.animalwelfare.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequiredArgsConstructor
public class DashboardController {

    private final AnimalService animalService;
    private final UserService userService;

    @GetMapping("/dashboard")
    public String dashboard(
            @AuthenticationPrincipal UserDetails userDetails,
            Model model) {

        User currentUser = userService.findByUsername(userDetails.getUsername()).orElseThrow();

        model.addAttribute("user",           currentUser);
        model.addAttribute("postedAnimals",  animalService.getAnimalsByUser(currentUser));
        model.addAttribute("adoptedAnimals", animalService.getAnimalsAdoptedBy(currentUser));
        model.addAttribute("postedCount",    animalService.countPostedBy(currentUser));
        model.addAttribute("adoptedCount",   animalService.countAdoptedBy(currentUser));

        return "dashboard";
    }
}
