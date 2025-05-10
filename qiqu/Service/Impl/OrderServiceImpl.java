package com.example.oldproject.Service.Impl;

import com.example.oldproject.Entity.Order;
import com.example.oldproject.Mapper.OrderMapper;
import com.example.oldproject.Service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Date;
import java.util.UUID;
import java.text.SimpleDateFormat;

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
    public int createOrder(Order order) {
        // 生成订单ID：时间戳 + UUID的前8位
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
        String timestamp = sdf.format(new Date());
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        String orderId = timestamp + uuid;
        
        // 设置订单ID
        order.setId(orderId);
        
        // 设置创建时间和更新时间已在Controller中处理
        // 设置状态已在Controller中处理
        
        return orderMapper.createOrder(order);
    }

    @Override
    public int updateOrder(Order order) {
        return orderMapper.updateOrder(order);
    }

    @Override
    public int deleteOrder(String id) {
        return orderMapper.deleteOrder(id);
    }

    @Override
    public List<Order> getOrdersByStatus(String status) {
        return orderMapper.getOrdersByStatus(status);
    }

    @Override
    public List<Order> getOrdersByUserId(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("用户ID不能为空");
        }
        return orderMapper.getOrdersByUserId(userId);
    }
} 