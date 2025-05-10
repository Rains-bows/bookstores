package com.example.oldproject.PoJo;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.sql.Timestamp;

@Data
@TableName("admin_operation_log")
public class AdminOperationLog {
    @TableId(type = IdType.AUTO)
    private Integer id;
    private Integer adminId;
    private Timestamp operationTime;
    private String operationType;
    private String operationDetails;
    private String ipAddress;
    private String requestMethod;
    private String requestUrl;
}