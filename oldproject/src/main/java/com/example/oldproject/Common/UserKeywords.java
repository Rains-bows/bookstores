package com.example.oldproject.Common;

public class UserKeywords {

    // 用户注册相关提示
    public static final String UserNameHas = "用户名已存在";  // 用户名已存在
    public static final String UserNameEmpty = "用户名不能为空";  // 用户名为空
    public static final String PasswordEmpty = "密码不能为空";    // 密码为空
    public static final String PasswordShort = "密码长度过短，至少6个字符"; // 密码太短
    public static final String EmailInvalid = "无效的电子邮件地址"; // 邮箱无效
    public static final String RegisterSuccess = "注册成功"; // 注册成功
    public static final String RegisterFail = "注册失败，请稍后重试"; // 注册失败

    // 用户登录相关提示
    public static final String LoginSuccess = "登录成功"; // 登录成功
    public static final String LoginFail = "用户名或密码错误"; // 用户名或密码错误
    public static final String AccountLocked = "账户已被锁定，请联系管理员"; // 账户被锁定
    public static final String AccountNotFound = "用户不存在"; // 用户不存在
    public static final String PasswordIncorrect = "密码不正确"; // 密码错误
    public static final String LoginRequired = "请先登录"; // 用户未登录

    // 密码修改相关提示
    public static final String OldPasswordIncorrect = "旧密码不正确"; // 旧密码不正确
    public static final String PasswordUpdateSuccess = "密码更新成功"; // 密码更新成功
    public static final String PasswordUpdateFail = "密码更新失败，请稍后重试"; // 密码更新失败

    // 用户信息修改相关提示
    public static final String UserInfoUpdateSuccess = "用户信息更新成功"; // 用户信息更新成功
    public static final String UserInfoUpdateFail = "用户信息更新失败"; // 用户信息更新失败

    // 会话相关提示
    public static final String SessionTimeout = "会话超时，请重新登录"; // 会话超时
    public static final String SessionInvalid = "无效的会话"; // 无效的会话

    // 常见的成功与失败提示
    public static final String Success = "操作成功"; // 操作成功
    public static final String Fail = "操作失败，请重试"; // 操作失败

    // 用户名或其他字段验证
    public static final String UserNameFormatError = "用户名格式不正确"; // 用户名格式错误
    public static final String EmailFormatError = "邮箱格式不正确"; // 邮箱格式错误
    public static final String PhoneFormatError = "电话号码格式不正确"; // 电话号码格式错误
    public static final String UserNameExist = "该用户名已被注册"; // 用户名已被注册
    public static final String UserNameAvailable = "用户名可用"; // 用户名可用

    // 其他提示
    public static final String UnauthorizedAccess = "无权限访问"; // 无权限访问
    public static final String AccountLockedTemporarily = "账户暂时锁定，请稍后再试"; // 账户暂时锁定
    public static final String MaxAttemptExceeded = "登录尝试次数过多，请稍后再试"; // 登录次数过多
    public static final String EmailSendSuccess = "邮件发送成功，请检查邮箱"; // 邮件发送成功
    public static final String EmailSendFail = "邮件发送失败，请稍后再试"; // 邮件发送失败

    // 其他通用成功与失败
    public static final String UpdateSuccess = "更新成功"; // 更新成功
    public static final String UpdateFail = "更新失败，请稍后重试"; // 更新失败
}
