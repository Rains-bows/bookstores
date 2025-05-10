package com.example.oldproject.PoJo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.sql.Timestamp;

@Data
@TableName("admin_login_log")
public class AdminLoginLog {
    @TableId(type = IdType.AUTO)
    private Integer id;
    private Integer adminId;
    private Timestamp loginTime;
    private Timestamp logoutTime;
    private String ipAddress;
    private String deviceInfo;
    private String sessionId;
}