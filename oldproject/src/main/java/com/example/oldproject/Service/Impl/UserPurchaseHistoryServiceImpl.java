package com.example.oldproject.Service.Impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.oldproject.Mapper.UserPurchaseHistoryMapper;
import com.example.oldproject.PoJo.UserPurchaseHistory;
import com.example.oldproject.Service.UserPurchaseHistoryService;
import org.springframework.stereotype.Service;

@Service
public class UserPurchaseHistoryServiceImpl extends ServiceImpl<UserPurchaseHistoryMapper, UserPurchaseHistory> implements UserPurchaseHistoryService {
}