package com.docflow.documentservice.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/documents/test")
    public String test() {

        return "Document Service Working";
    }
}