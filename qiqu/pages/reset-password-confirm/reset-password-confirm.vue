<template>
  <view class="container">
    <view class="card">
      <view class="form">
        <el-input
          v-model="username"
          placeholder="请输入用户名"
          class="input"
          clearable
        />
        <el-input
          v-model="newPassword"
          placeholder="请输入新密码"
          type="password"
          class="input"
          show-password
        />
        <el-input
          v-model="confirmPassword"
          placeholder="请确认新密码"
          type="password"
          class="input"
          show-password
        />
        <el-input
          v-model="emailCode"
          placeholder="请输入验证码"
          class="input"
          clearable
        />
        <el-button
          type="primary"
          @click="handleResetPassword"
          class="reset-btn"
          :loading="loading"
        >
          重置密码
        </el-button>
      </view>
    </view>
  </view>
</template>
<script>
import { resetPassword } from '@/api/user';
import { ElNotification } from 'element-plus'; // 引入 Element Plus 的 Notification 组件

export default {
  data() {
    return {
      username: '',
      newPassword: '',
      confirmPassword: '',
      emailCode: '',
      loading: false, // 加载状态
    };
  },
  methods: {
    // 表单验证
    validateForm() {
      if (!this.username || !this.newPassword || !this.confirmPassword || !this.emailCode) {
        ElNotification({
          title: '警告',
          message: '请填写完整信息',
          type: 'warning',
        });
        return false;
      }

      if (this.newPassword !== this.confirmPassword) {
        ElNotification({
          title: '警告',
          message: '两次输入的密码不一致',
          type: 'warning',
        });
        return false;
      }

      // 密码长度验证
      if (this.newPassword.length < 6 || this.newPassword.length > 20) {
        ElNotification({
          title: '警告',
          message: '密码长度应为6-20位字符',
          type: 'warning',
        });
        return false;
      }

      return true;
    },

    // 重置密码
    async handleResetPassword() {
      if (!this.validateForm()) {
        return;
      }

      this.loading = true; // 开始加载
      try {
        const res = await resetPassword({
          username: this.username,
          newPassword: this.newPassword,
          emailCode: this.emailCode,
        });

        if (res.code === 200) {
          ElNotification({
            title: '成功',
            message: '密码重置成功',
            type: 'success',
          });
          uni.navigateBack();
        } else {
          ElNotification({
            title: '错误',
            message: res.message || '密码重置失败',
            type: 'error',
          });
        }
      } catch (error) {
        ElNotification({
          title: '错误',
          message: '密码重置失败，请稍后重试',
          type: 'error',
        });
      } finally {
        this.loading = false; // 结束加载
      }
    },
  },
};
</script>
<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f0f2f5;
  padding: 20px;
}

.card {
  background-color: #fff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.form {
  display: flex;
  flex-direction: column;
}

.input {
  width: 100%;
  margin-bottom: 20px;
}

.input >>> .el-input__inner {
  padding: 12px 16px;
  font-size: 14px;
  border-radius: 8px;
}

.reset-btn {
  width: 100%;
  font-size: 16px;
  padding: 12px 0;
  border-radius: 8px;
}

.reset-btn:hover {
  opacity: 0.9;
}

/* 媒体查询：小屏幕适配 */
@media (max-width: 600px) {
  .card {
    padding: 20px;
  }

  .input >>> .el-input__inner {
    padding: 10px 14px;
    font-size: 13px;
  }

  .reset-btn {
    font-size: 14px;
    padding: 10px 0;
  }
}
</style>