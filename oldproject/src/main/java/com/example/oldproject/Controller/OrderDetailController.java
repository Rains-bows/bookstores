package com.example.oldproject.Controller;

import com.example.oldproject.Controller2.BaseController;
import com.example.oldproject.DTO.OrderDetailDTO;
import com.example.oldproject.PoJo.OrderDetail;
import com.example.oldproject.Service.OrderDetailService;
import com.example.oldproject.Util.ApiResponse;
import com.example.oldproject.annotation.RequireLogin;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/orderDetails")
@Tag(name = "订单详情管理", description = "订单详情的增删改查操作")
@RequireLogin
public class OrderDetailController extends BaseController {

    @Autowired
    private OrderDetailService orderDetailService;

    @GetMapping("/order/{orderId}")
    @Operation(summary = "获取订单详情", description = "获取指定订单的详情信息")
    public ApiResponse<List<OrderDetailDTO>> getOrderDetailInfo(
            @Parameter(description = "订单ID", required = true)
            @PathVariable String orderId) {
        try {
            List<OrderDetailDTO> details = orderDetailService.getOrderDetailInfo(orderId);
            return ApiResponse.success(details);
        } catch (IllegalArgumentException e) {
            return ApiResponse.failure("参数错误: " + e.getMessage());
        } catch (RuntimeException e) {
            return ApiResponse.failure(e.getMessage());
        } catch (Exception e) {
            return ApiResponse.failure("获取订单详情失败: " + e.getMessage());
        }
    }

    @GetMapping("/list")
    @Operation(summary = "获取所有订单详情", description = "获取所有非待付款订单的详情")
    public ApiResponse<List<OrderDetailDTO>> getAllOrderDetails() {
        try {
            List<OrderDetailDTO> details = orderDetailService.getAllOrderDetailsWithInfo();
            return ApiResponse.success(details);
        } catch (RuntimeException e) {
            return ApiResponse.failure(e.getMessage());
        } catch (Exception e) {
            return ApiResponse.failure("获取订单详情失败: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "根据ID获取订单详情", description = "根据订单详情ID查询订单详情信息")
    public ApiResponse<OrderDetail> getOrderDetailById(
            @Parameter(description = "订单详情ID", required = true) 
            @PathVariable Integer id) {
        try {
            OrderDetail orderDetail = orderDetailService.getOrderDetailById(id);
            if (orderDetail != null) {
                return ApiResponse.success(orderDetail);
            } else {
                return ApiResponse.failure("订单详情未找到");
            }
        } catch (Exception e) {
            return ApiResponse.failure("获取订单详情失败: " + e.getMessage());
        }
    }

    @PostMapping
    @Operation(summary = "创建订单详情", description = "创建一个新的订单详情")
    public ApiResponse<Void> createOrderDetail(
            @Parameter(description = "订单详情对象", required = true) 
            @RequestBody OrderDetail orderDetail) {
        try {
            orderDetailService.createOrderDetail(orderDetail);
            return ApiResponse.success(null);
        } catch (Exception e) {
            return ApiResponse.failure("创建订单详情失败: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新订单详情", description = "根据订单详情ID更新订单详情信息")
    public ApiResponse<Void> updateOrderDetail(
            @Parameter(description = "订单详情ID", required = true) 
            @PathVariable Integer id,
            @Parameter(description = "订单详情对象", required = true) 
            @RequestBody OrderDetail orderDetail) {
        try {
            orderDetail.setId(id);
            orderDetailService.updateOrderDetail(orderDetail);
            return ApiResponse.success(null);
        } catch (Exception e) {
            return ApiResponse.failure("更新订单详情失败: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除订单详情", description = "根据订单详情ID删除订单详情")
    public ApiResponse<Void> deleteOrderDetail(
            @Parameter(description = "订单详情ID", required = true) 
            @PathVariable Integer id) {
        try {
            orderDetailService.deleteOrderDetail(id);
            return ApiResponse.success(null);
        } catch (Exception e) {
            return ApiResponse.failure("删除订单详情失败: " + e.getMessage());
        }
    }
}