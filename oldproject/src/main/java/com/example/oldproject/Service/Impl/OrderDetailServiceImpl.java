package com.example.oldproject.Service.Impl;

import com.example.oldproject.Mapper.OrderDetailMapper;
import com.example.oldproject.PoJo.OrderDetail;
import com.example.oldproject.Service.OrderDetailService;
import com.example.oldproject.DTO.OrderDetailDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderDetailServiceImpl implements OrderDetailService {

    @Autowired
    private OrderDetailMapper orderDetailMapper;

    @Override
    public List<OrderDetail> getBasicOrderDetails() {
        return orderDetailMapper.getBasicOrderDetails();
    }

    @Override
    public OrderDetail getOrderDetailById(Integer id) {
        return orderDetailMapper.getOrderDetailById(id);
    }

    @Override
    public void createOrderDetail(OrderDetail orderDetail) {
        orderDetailMapper.createOrderDetail(orderDetail);
    }

    @Override
    public void updateOrderDetail(OrderDetail orderDetail) {
        orderDetailMapper.updateOrderDetail(orderDetail);
    }

    @Override
    public void deleteOrderDetail(Integer id) {
        orderDetailMapper.deleteOrderDetail(id);
    }

    @Override
    public List<OrderDetailDTO> getOrderDetailInfo(String orderId) {
        if (orderId == null || orderId.trim().isEmpty()) {
            throw new IllegalArgumentException("订单ID不能为空");
        }
        List<OrderDetailDTO> details = orderDetailMapper.getOrderDetailInfo(orderId);
        if (details.isEmpty()) {
            throw new RuntimeException("未找到订单详情");
        }
        return details;
    }

    @Override
    public List<OrderDetailDTO> getAllOrderDetailsWithInfo() {
        List<OrderDetailDTO> details = orderDetailMapper.getAllOrderDetailsWithInfo();
        if (details.isEmpty()) {
            throw new RuntimeException("未找到任何订单详情");
        }
        return details;
    }
}
