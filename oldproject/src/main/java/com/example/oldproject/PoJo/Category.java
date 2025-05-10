package com.example.oldproject.PoJo;

import java.io.Serializable;
import java.util.List;
import java.util.ArrayList;
import lombok.Data;

@Data
public class Category implements Serializable {
    private Integer id;
    private String name;
    private String description;
    private Boolean isActive = true;
    private List<Product> products = new ArrayList<>(); // 初始化为空列表而不是 null

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public List<Product> getProducts() {
        return products == null ? new ArrayList<>() : products;
    }

    public void setProducts(List<Product> products) {
        this.products = products;
    }
}