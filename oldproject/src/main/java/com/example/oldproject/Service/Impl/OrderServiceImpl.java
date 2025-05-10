package com.example.oldproject.Service.Impl;

import com.example.oldproject.Config.UserContextHolder;
import com.example.oldproject.Mapper.OrderMapper;
import com.example.oldproject.PoJo.Order;
import com.example.oldproject.Service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderMapper orderMapper;

    @Override
    public List<Order> getAllOrders() {
        return orderMapper.getAllOrders();
    }

    @Override
    public Order getOrderById(String id) {
        return orderMapper.getOrderById(id);
    }

    @Override
    public void createOrder(Order order) {
        orderMapper.createOrder(order);
    }

    @Override
    public void updateOrder(Order order) {
        orderMapper.updateOrder(order);
    }

    @Override
    public void deleteOrder(String id) {
        orderMapper.deleteOrder(id);
    }

    @Override
    public List<Order> getOrdersByStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            throw new IllegalArgumentException("订单状态不能为空");
        }
        
        // 从 ThreadLocal 中获取当前用户ID
        Long userId = UserContextHolder.getUserContext().getUserId();
        if (userId == null) {
            throw new RuntimeException("用户未登录");
        }
        
        return orderMapper.findByStatus(status, userId);
    }

    @Override
    public List<Order> getOrdersByUserId(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("用户ID不能为空");
        }
        return orderMapper.findByUserId(userId);
    }
}
