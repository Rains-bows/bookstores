package com.example.oldproject.Controller;

import com.example.oldproject.PoJo.Payment;
import com.example.oldproject.Service.PaymentService;
import com.example.oldproject.Util.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@CrossOrigin
@RestController
@RequestMapping("/api/payments")
@Tag(name = "支付记录管理", description = "支付记录的增删改查操作")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    /**
     * 获取所有支付记录
     *
     * @return 返回所有支付记录的列表
     */
    @GetMapping
    @Operation(summary = "获取所有支付记录", description = "返回所有支付记录的列表")
    public ApiResponse<List<Payment>> getAllPayments() {
        return ApiResponse.success(paymentService.getAllPayments());
    }

    /**
     * 根据ID获取支付记录
     *
     * @param id 支付记录ID
     * @return 返回查询到的支付记录
     */
    @GetMapping("/{id}")
    @Operation(summary = "根据ID获取支付记录", description = "根据支付记录ID查询支付记录信息")
    public ApiResponse<Payment> getPaymentById(
            @Parameter(description = "支付记录ID", required = true) @PathVariable Integer id) {
        Payment payment = paymentService.getPaymentById(id);
        if (payment != null) {
            return ApiResponse.success(payment);
        } else {
            return ApiResponse.failure("支付记录未找到");
        }
    }

    /**
     * 创建支付记录
     *
     * @param payment 支付记录对象
     * @return 返回操作结果
     */
    @PostMapping
    @Operation(summary = "创建支付记录", description = "创建一个新的支付记录")
    public ApiResponse<Void> createPayment(
            @Parameter(description = "支付记录对象", required = true) @RequestBody Payment payment) {
        paymentService.createPayment(payment);
        return ApiResponse.success(null);
    }

    /**
     * 更新支付记录
     *
     * @param id      支付记录ID
     * @param payment 支付记录对象
     * @return 返回操作结果
     */
    @PutMapping("/{id}")
    @Operation(summary = "更新支付记录", description = "根据支付记录ID更新支付记录信息")
    public ApiResponse<Void> updatePayment(
            @Parameter(description = "支付记录ID", required = true) @PathVariable Integer id,
            @Parameter(description = "支付记录对象", required = true) @RequestBody Payment payment) {
        payment.setId(id);
        paymentService.updatePayment(payment);
        return ApiResponse.success(null);
    }

    /**
     * 删除支付记录
     *
     * @param id 支付记录ID
     * @return 返回操作结果
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除支付记录", description = "根据支付记录ID删除支付记录")
    public ApiResponse<Void> deletePayment(
            @Parameter(description = "支付记录ID", required = true) @PathVariable Integer id) {
        paymentService.deletePayment(id);
        return ApiResponse.success(null);
    }
}