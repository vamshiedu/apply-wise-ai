package com.applywise.backend;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class test {
    @GetMapping("/greet")
    public String Greet() {
        return "Hello world";
    }
}
