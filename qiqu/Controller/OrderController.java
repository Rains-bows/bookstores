package com.example.oldproject.Controller;

import com.example.oldproject.Entity.Order;
import com.example.oldproject.Service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/order")
public class OrderController {
    @Autowired
    private OrderService orderService;

    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestBody Order order) {
        try {
            int result = orderService.createOrder(order);
            Map<String, Object> response = new HashMap<>();
            if (result > 0) {
                response.put("code", 1);
                response.put("message", "success");
                response.put("data", order);
            } else {
                response.put("code", 0);
                response.put("message", "创建订单失败");
                response.put("data", null);
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("code", 0);
            response.put("message", e.getMessage());
            response.put("data", null);
            return ResponseEntity.ok(response);
        }
    }

    @GetMapping("/list")
    public ResponseEntity<?> getOrderList(@RequestParam Integer userId) {
        try {
            List<Order> orders = orderService.getOrderList(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("code", 1);
            response.put("message", "success");
            response.put("data", orders);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("code", 0);
            response.put("message", e.getMessage());
            response.put("data", null);
            return ResponseEntity.ok(response);
        }
    }

    @GetMapping("/detail/{id}")
    public ResponseEntity<?> getOrderDetail(@PathVariable String id) {
        try {
            Order order = orderService.getOrderDetail(id);
            Map<String, Object> response = new HashMap<>();
            if (order != null) {
                response.put("code", 1);
                response.put("message", "success");
                response.put("data", order);
            } else {
                response.put("code", 0);
                response.put("message", "订单不存在");
                response.put("data", null);
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("code", 0);
            response.put("message", e.getMessage());
            response.put("data", null);
            return ResponseEntity.ok(response);
        }
    }

    @PostMapping("/status/update")
    public ResponseEntity<?> updateOrderStatus(@RequestParam String id, @RequestParam String status) {
        try {
            int result = orderService.updateOrderStatus(id, status);
            Map<String, Object> response = new HashMap<>();
            if (result > 0) {
                response.put("code", 1);
                response.put("message", "success");
                response.put("data", null);
            } else {
                response.put("code", 0);
                response.put("message", "更新订单状态失败");
                response.put("data", null);
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("code", 0);
            response.put("message", e.getMessage());
            response.put("data", null);
            return ResponseEntity.ok(response);
        }
    }

    @PostMapping("/delete/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable String id) {
        try {
            int result = orderService.deleteOrder(id);
            Map<String, Object> response = new HashMap<>();
            if (result > 0) {
                response.put("code", 1);
                response.put("message", "success");
                response.put("data", null);
            } else {
                response.put("code", 0);
                response.put("message", "删除订单失败");
                response.put("data", null);
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("code", 0);
            response.put("message", e.getMessage());
            response.put("data", null);
            return ResponseEntity.ok(response);
        }
    }
} 