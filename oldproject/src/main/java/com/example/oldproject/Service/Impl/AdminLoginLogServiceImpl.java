package com.example.oldproject.Service.Impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.oldproject.Mapper.AdminLoginLogMapper;
import com.example.oldproject.PoJo.AdminLoginLog;
import com.example.oldproject.Service.AdminLoginLogService;
import org.springframework.stereotype.Service;

@Service
public class AdminLoginLogServiceImpl extends ServiceImpl<AdminLoginLogMapper, AdminLoginLog> implements AdminLoginLogService {
}