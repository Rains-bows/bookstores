package com.example.oldproject.Service.Impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.oldproject.Mapper.AdminOperationLogMapper;
import com.example.oldproject.PoJo.AdminOperationLog;
import com.example.oldproject.Service.AdminOperationLogService;
import org.springframework.stereotype.Service;

@Service
public class AdminOperationLogServiceImpl extends ServiceImpl<AdminOperationLogMapper, AdminOperationLog> implements AdminOperationLogService {
}