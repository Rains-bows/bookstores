package com.example.oldproject.Service.Impl;

import com.example.oldproject.Mapper.PaymentMapper;
import com.example.oldproject.PoJo.Payment;
import com.example.oldproject.Service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private PaymentMapper paymentMapper;

    @Override
    public List<Payment> getAllPayments() {
        return paymentMapper.getAllPayments();
    }

    @Override
    public Payment getPaymentById(Integer id) {
        return paymentMapper.getPaymentById(id);
    }

    @Override
    public void createPayment(Payment payment) {
        paymentMapper.createPayment(payment);
    }

    @Override
    public void updatePayment(Payment payment) {
        paymentMapper.updatePayment(payment);
    }

    @Override
    public void deletePayment(Integer id) {
        paymentMapper.deletePayment(id);
    }
}
