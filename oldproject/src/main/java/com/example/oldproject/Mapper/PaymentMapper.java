package com.example.oldproject.Mapper;

import com.example.oldproject.PoJo.Payment;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface PaymentMapper {


    List<Payment> getAllPayments();


    Payment getPaymentById(Integer id);


    void createPayment(Payment payment);


    void updatePayment(Payment payment);


    void deletePayment(Integer id);
}
