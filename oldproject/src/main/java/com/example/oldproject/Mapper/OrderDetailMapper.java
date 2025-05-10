package com.example.oldproject.Mapper;

import com.example.oldproject.PoJo.OrderDetail;
import com.example.oldproject.DTO.OrderDetailDTO;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface OrderDetailMapper {

    /**
     * 基础订单详情查询
     */
    List<OrderDetail> getBasicOrderDetails();

    /**
     * 根据ID查询订单详情
     */
    OrderDetail getOrderDetailById(Integer id);

    /**
     * 创建订单详情
     */
    void createOrderDetail(OrderDetail orderDetail);

    /**
     * 更新订单详情
     */
    void updateOrderDetail(OrderDetail orderDetail);

    /**
     * 删除订单详情
     */
    void deleteOrderDetail(Integer id);

    /**
     * 获取指定订单的详情信息（包含商品和地址信息）
     */
    List<OrderDetailDTO> getOrderDetailInfo(@Param("orderId") String orderId);

    /**
     * 获取所有订单详情（除待付款订单，包含商品和地址信息）
     */
    List<OrderDetailDTO> getAllOrderDetailsWithInfo();
}
