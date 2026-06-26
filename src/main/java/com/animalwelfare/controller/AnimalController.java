package com.animalwelfare.controller;

import com.animalwelfare.dto.AnimalDto;
import com.animalwelfare.model.User;
import com.animalwelfare.service.AnimalService;
import com.animalwelfare.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/animals")
@RequiredArgsConstructor
public class AnimalController {

    private final AnimalService animalService;
    private final UserService userService;

    @GetMapping
    public String listAnimals(
            @RequestParam(value = "category", required = false) String category,
            Model model) {

        model.addAttribute("animals",  animalService.filterByCategory(category));
        model.addAttribute("category", category);
        return "animals/list";
    }

    @GetMapping("/publish")
    public String publishForm(Model model) {
        model.addAttribute("animalDto", new AnimalDto());
        return "animals/publish";
    }

    @PostMapping("/publish")
    public String publishAnimal(
            @Valid @ModelAttribute("animalDto") AnimalDto dto,
            BindingResult bindingResult,
            @AuthenticationPrincipal UserDetails userDetails,
            RedirectAttributes redirectAttributes,
            Model model) {

        if (bindingResult.hasErrors()) {
            return "animals/publish";
        }

        try {
            User currentUser = userService.findByUsername(userDetails.getUsername()).orElseThrow();
            animalService.publishAnimal(dto, currentUser);
            redirectAttributes.addFlashAttribute("successMsg",
                    "Animal posted successfully! Thank you for helping.");
            return "redirect:/animals";
        } catch (Exception e) {
            model.addAttribute("errorMsg", "Failed to publish: " + e.getMessage());
            return "animals/publish";
        }
    }

    @PostMapping("/{id}/adopt")
    public String adoptAnimal(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            RedirectAttributes redirectAttributes) {

        User currentUser = userService.findByUsername(userDetails.getUsername()).orElseThrow();
        boolean success = animalService.adoptAnimal(id, currentUser);

        if (success) {
            redirectAttributes.addFlashAttribute("successMsg",
                    "Congratulations! You have successfully adopted an animal.");
        } else {
            redirectAttributes.addFlashAttribute("errorMsg",
                    "This animal is no longer available for adoption.");
        }
        return "redirect:/animals";
    }
}
