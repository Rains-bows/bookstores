package com.example.oldproject.Controller;

import com.example.oldproject.Common.UserKeywords;
import com.example.oldproject.PoJo.User;
import com.example.oldproject.PoJo.UserLoginLog;
import com.example.oldproject.Service.UserLoginLogService;
import com.example.oldproject.Service.UserService;
import com.example.oldproject.Util.ApiResponse;
import com.example.oldproject.Util.JwtUtil;
import com.example.oldproject.Util.MD5Util;
import com.example.oldproject.Model.LoginResponse;
import com.example.oldproject.Controller2.BaseController;
import com.example.oldproject.annotation.RequireLogin;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;
@CrossOrigin
@RestController
@RequestMapping("/api/user")
@Tag(name = "用户管理", description = "用户的注册、登录、信息更新、密码重置等操作")
public class UserController extends BaseController {

    @Autowired
    private UserService userService;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private UserLoginLogService userLoginLogService;
    /**
     * 用户注册
     *
     * @param user 用户对象
     * @return 返回注册结果
     */
    @PostMapping("/register")
    @Operation(summary = "用户注册", description = "用户注册接口")
    public ApiResponse<User> register(
            @Parameter(description = "用户对象", required = true) @Validated @RequestBody User user) {
        User judgeUser = userService.findByUserName(user.getUsername());
        if (judgeUser == null) {
            String password = user.getPassword();
            String encrypt = MD5Util.encrypt(password);
            user.setPassword(encrypt);
            user.setCreatedAt(Timestamp.valueOf(LocalDateTime.now()));
            user.setUpdatedAt(Timestamp.valueOf(LocalDateTime.now()));

            userService.insertUser(user);
            return ApiResponse.success(user);
        } else {
            return ApiResponse.failure(UserKeywords.UserNameHas);
        }
    }

    /**
     * 用户登录
     *
     * @param user 用户对象
     * @return 返回登录结果
     */
    @PostMapping("/login")
    @Operation(summary = "用户登录", description = "用户登录接口")
    public ApiResponse<LoginResponse> login(
            @Parameter(description = "用户对象", required = true) @Validated @RequestBody User user,
            HttpServletRequest request) {

        User byUserName = userService.findByUserName(user.getUsername());
        if (byUserName != null) {
            if (MD5Util.verify(user.getPassword(), byUserName.getPassword())) {
                // 生成token
                String token = JwtUtil.generateToken(Long.valueOf(byUserName.getId()), byUserName.getUsername());

                // 更新Redis中的token
                redisTemplate.delete(user.getUsername());
                redisTemplate.opsForValue().set(user.getUsername(), token);
                redisTemplate.expire(user.getUsername(), 60, TimeUnit.MINUTES);

                // 记录登录日志
                UserLoginLog loginLog = new UserLoginLog();
                loginLog.setUserId(byUserName.getId());
                loginLog.setLoginTime(new Timestamp(System.currentTimeMillis()));
                loginLog.setIpAddress(request.getRemoteAddr()); // 获取客户端IP
                loginLog.setDeviceInfo(request.getHeader("User-Agent")); // 获取设备信息
                loginLog.setSessionId(request.getSession().getId()); // 获取会话ID
                userLoginLogService.save(loginLog); // 保存日志

                // 构造响应
                LoginResponse loginResponse = new LoginResponse();
                loginResponse.setToken(token);
                loginResponse.setUserId(Long.valueOf(byUserName.getId()));
                loginResponse.setUsername(byUserName.getUsername());

                return ApiResponse.success(loginResponse);
            } else {
                return ApiResponse.failure(UserKeywords.PasswordIncorrect);
            }
        } else {
            return ApiResponse.failure("用户不存在，请注册");
        }
    }

    /**
     * 更新用户信息
     *
     * @param user 用户对象
     * @return 返回更新结果
     */
    @RequireLogin
    @PutMapping("/update")
    @Operation(summary = "更新用户信息", description = "更新用户信息接口")
    public ApiResponse<String> updateUser(@RequestBody User user) {
        // 确保只能更新当前登录用户的信息
        Long currentUserId = getCurrentUserId();
        if (!currentUserId.equals(user.getId())) {
            return ApiResponse.failure("无权修改其他用户的信息");
        }
        
        boolean updated = userService.updateUserInfo(user);
        if (updated) {
            return ApiResponse.success("用户信息更新成功");
        }
        return ApiResponse.failure("更新失败");
    }

    /**
     * 发送邮箱验证码
     *
     * @param username 用户名
     * @param email    邮箱
     * @return 返回发送结果
     */
    @PostMapping("/send-email-code")
    @Operation(summary = "发送邮箱验证码", description = "发送邮箱验证码接口")
    public ApiResponse<String> sendEmailCode(
            @Parameter(description = "用户名", required = true) @RequestParam String username,
            @Parameter(description = "邮箱", required = true) @RequestParam String email) {
        boolean isSent = userService.sendEmailCode(username, email);
        if (isSent) {
            return ApiResponse.success("验证码已发送，请检查您的邮箱");
        } else {
            return ApiResponse.failure("发送失败，用户名或邮箱不匹配");
        }
    }

    /**
     * 重置密码
     *
     * @param username    用户名
     * @param newPassword 新密码
     * @param emailCode   邮箱验证码
     * @return 返回重置结果
     */
    @PostMapping("/reset-password")
    @Operation(summary = "重置密码", description = "重置密码接口")
    public ApiResponse<String> resetPassword(
            @Parameter(description = "用户名", required = true) @RequestParam String username,
            @Parameter(description = "新密码", required = true) @RequestParam String newPassword,
            @Parameter(description = "邮箱验证码", required = true) @RequestParam String emailCode) {
        System.out.println(username);
        System.out.println(newPassword);
        System.out.println(emailCode);
        boolean isVerified = userService.verifyEmailCode(username, emailCode);
        if (!isVerified) {
            return ApiResponse.failure("验证码错误或已过期");
        }

        boolean isReset = userService.resetPassword(username, newPassword);
        if (isReset) {
            return ApiResponse.success("密码重置成功");
        } else {
            return ApiResponse.failure("重置失败，用户不存在");
        }
    }

    /**
     * 测试邮箱验证码
     *
     * @param code     验证码
     * @param userName 用户名
     * @return 返回验证结果
     */
    @PostMapping("/test-email-code")
    @Operation(summary = "测试邮箱验证码", description = "测试邮箱验证码接口")
    public ApiResponse<Boolean> testEmailCode(
            @Parameter(description = "验证码", required = true) @RequestParam String code,
            @Parameter(description = "用户名", required = true) @RequestParam String userName) {
        boolean isVerified = userService.verifyEmailCode(userName, code);
        return ApiResponse.success(isVerified);
    }

    /**
     * 获取用户信息
     *
     * @param username 用户名
     * @return 返回用户信息
     */
    @GetMapping("/info")
    @Operation(summary = "获取用户信息", description = "获取用户信息接口")
    public ApiResponse<User> getUserInfo(
            @Parameter(description = "用户名", required = true) @RequestParam String username) {
        User user = userService.findByUserName(username);
        if (user != null) {
            // 隐藏敏感信息（如密码）
            user.setPassword(null);
            return ApiResponse.success(user);
        } else {
            return ApiResponse.failure("用户不存在");
        }
    }

    /**
     * 获取当前登录用户信息
     */
    @RequireLogin
    @GetMapping("/current")
    @Operation(summary = "获取当前用户信息", description = "获取当前登录用户的信息")
    public ApiResponse<User> getCurrentUserInfo() {
        // 使用 BaseController 中的方法获取当前用户信息
        Long userId = getCurrentUserId();
        String username = getCurrentUsername();
        
        User user = userService.findByUserName(username);
        if (user != null) {
            user.setPassword(null); // 出于安全考虑，不返回密码
            return ApiResponse.success(user);
        }
        return ApiResponse.failure("获取用户信息失败");
    }
}