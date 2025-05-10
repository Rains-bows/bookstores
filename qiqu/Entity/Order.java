package com.example.oldproject.Entity;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Date;

@Data
public class Order {
    private String id;
    private Integer userId;
    private BigDecimal totalAmount;
    private String status;
    private Date createdAt;
    private Date updatedAt;
} 