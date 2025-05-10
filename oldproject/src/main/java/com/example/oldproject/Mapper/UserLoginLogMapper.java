package com.example.oldproject.Mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.oldproject.PoJo.UserLoginLog;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserLoginLogMapper extends BaseMapper<UserLoginLog> {
}