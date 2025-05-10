package com.example.oldproject.Service;

import com.example.oldproject.PoJo.Payment;

import java.util.List;

public interface PaymentService {
    List<Payment> getAllPayments();
    Payment getPaymentById(Integer id);
    void createPayment(Payment payment);
    void updatePayment(Payment payment);
    void deletePayment(Integer id);
}
