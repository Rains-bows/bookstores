package com.example.oldproject.Service.Impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.oldproject.Mapper.UserLoginLogMapper;
import com.example.oldproject.PoJo.UserLoginLog;
import com.example.oldproject.Service.UserLoginLogService;
import org.springframework.stereotype.Service;

@Service
public class UserLoginLogServiceImpl extends ServiceImpl<UserLoginLogMapper, UserLoginLog> implements UserLoginLogService {
}