package com.example.oldproject.Service.Impl;

import com.example.oldproject.Mapper.UserMapper;
import com.example.oldproject.PoJo.User;
import com.example.oldproject.Service.UserService;
import com.example.oldproject.Util.MD5Util;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

@Service
public class UserServiceImpl implements UserService {

    private static final String EMAIL_CODE_PREFIX = "email-code:";
    private static final String EMAIL_SENDER = "zaihuimall@163.com"; // 替换为实际邮箱地址

    @Autowired
    private final UserMapper userMapper;
    @Autowired
    private final JavaMailSender mailSender;
    @Autowired
    private final RedisTemplate<String, Object> redisTemplate;

    @Autowired
    public UserServiceImpl(UserMapper userMapper, JavaMailSender mailSender, RedisTemplate<String, Object> redisTemplate) {
        this.userMapper = userMapper;
        this.mailSender = mailSender;
        this.redisTemplate = redisTemplate;
    }

    @Override
    public User findByUserName(String name) {
        return userMapper.findByUserName(name);
    }

    @Override
    public void insertUser(User user) {
        userMapper.insertUser(user);
    }

    @Override
    public boolean updateUserInfo(User user) {
        User existingUser = userMapper.findByUserName(user.getUsername());
        if (existingUser != null) {
            user.setUpdatedAt(Timestamp.valueOf(LocalDateTime.now()));
            int rowsAffected = userMapper.updateUser(user);
            return rowsAffected > 0;
        }
        return false;
    }

    @Override
    public boolean sendEmailCode(String username, String email) {
        // 查找用户
        User user = userMapper.findByUserName(username);
        if (user == null || !user.getEmail().equals(email)) {
            return false;
        }

        // 生成验证码
        String code = String.valueOf((int) ((Math.random() * 9 + 1) * 100000));

        // 发送邮件
        try {
            sendEmail(email, "尊敬的用户您好，感谢您的使用！有问题反馈微信:L-922-virgo_ 密码重置验证码", "您的验证码是：" + code + "，有效期为5分钟。");
        } catch (MessagingException e) {
            // 记录异常日志
            e.printStackTrace();
            return false;
        }

        // 存储验证码到 Redis
        String key = EMAIL_CODE_PREFIX + username;
        redisTemplate.opsForValue().set(key, code, 5, TimeUnit.MINUTES);
        return true;
    }

    @Override
    public boolean verifyEmailCode(String username, String emailCode) {
        String key = EMAIL_CODE_PREFIX + username;
        String storedCode = (String) redisTemplate.opsForValue().get(key);
        return emailCode.equals(storedCode);
    }

    @Override
    public boolean resetPassword(String username, String newPassword) {
        User user = userMapper.findByUserName(username);
        if (user != null) {
            String encryptedPassword = MD5Util.encrypt(newPassword);
            int rowsAffected = userMapper.updatePassword(username, encryptedPassword);
            return rowsAffected > 0;
        }
        return false;
    }

    // 邮件发送逻辑
    private void sendEmail(String to, String subject, String content) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setFrom(EMAIL_SENDER); // 发件人邮箱，必须与用户名一致
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(content, true); // 设置为HTML格式内容
        mailSender.send(message); // 发送邮件
    }
}
