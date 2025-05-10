<template>
  <div class="chat-container">
    <!-- 欢迎提示 -->
    <div class="welcome-banner">
      <h3>📚 电商运营智能助手</h3>
      <p>欢迎咨询以下电商相关问题：<br>
        商品运营 | 流量转化 | 活动策划 | 用户增长 | 数据分析</p>
    </div>

    <!-- 消息列表区域 -->
    <div class="message-list" ref="messageList">
      <div 
        v-for="(msg, index) in chatHistory" 
        :key="index" 
        class="message-item"
        :class="msg.role"
      >
        <div class="message-card">
          <div class="message-header">
            <span class="role-tag">{{ roleMap[msg.role] }}</span>
            <span class="time">{{ formatTime(msg.timestamp) }}</span>
          </div>
          <div class="message-content">
            <pre>{{ msg.content }}</pre>
            <div v-if="msg.isError" class="error-message">
              <i class="icon-warning">⚠️</i>
              <span>{{ msg.errorMessage }}</span>
            </div>
            <div v-if="msg.isStreaming" class="streaming-indicator">▋</div>
          </div>
          <div v-if="msg.reasoning" class="reasoning-box">
            <div class="reasoning-header" @click="toggleReasoning(index)">
              <span>思考过程</span>
              <i :class="['arrow', showReasoning[index] ? 'up' : 'down']"></i>
            </div>
            <transition name="slide">
              <pre v-show="showReasoning[index]" class="reasoning-content">{{ msg.reasoning }}</pre>
            </transition>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-container">
      <div class="input-box">
        <textarea
          v-model="inputMessage"
          placeholder="请输入电商运营相关问题，例如：如何提升双十一活动转化率？"
          @keydown.enter.exact.prevent="sendMessage"
          @keydown.shift.enter="newLine"
          :disabled="isLoading"
          ref="textArea"
          @input="validateTopic"
        ></textarea>
        <div v-if="showTopicWarning" class="topic-warning">
          <i class="icon-info">ℹ️</i>
          <span>请提问电商运营相关问题（涉及商品、流量、转化率、用户增长等）</span>
        </div>
        <button 
          class="send-button"
          :class="{ loading: isLoading }"
          @click="sendMessage"
          :disabled="isLoading || !isInputValid"
        >
          <span v-if="!isLoading">发送</span>
          <div v-else class="loader"></div>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import OpenAI from "openai";
import { debounce } from 'lodash'

// 电商关键词列表
const ECOMMERCE_KEYWORDS = [
  '电商', '运营', '商品', '转化', '流量', 'GMV', 
  'ROI', '复购', '促销', '直播', '用户增长', '活动',
  '营销', '数据', '分析', '客单价', '留存率', '复购率'
]

export default {
  data() {
    return {
      inputMessage: '',
      chatHistory: [],
      isLoading: false,
      showReasoning: {},
      showTopicWarning: false,
      roleMap: {
        user: '您',
        assistant: '电商专家'
      },
      openai: null
    }
  },
  computed: {
    isInputValid() {
      return this.inputMessage.trim().length > 2 && 
             !this.showTopicWarning &&
             ECOMMERCE_KEYWORDS.some(kw => 
               this.inputMessage.toLowerCase().includes(kw.toLowerCase())
             )
    }
  },
  watch: {
    chatHistory: {
      handler: 'scrollToBottom',
      deep: true
    }
  },
  mounted() {
    // 初始化OpenAI客户端
    this.openai = new OpenAI({
      apiKey: "sk-37f06f4f3ce84c9e9eaa4ed6c926dbd9", // 替换为你的百炼API Key
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
      dangerouslyAllowBrowser: true // 允许在浏览器中使用
    });
    
    this.addWelcomeMessage();
  },
  methods: {
    async sendMessage() {
      if (!this.isInputValid || this.isLoading) return
      
      try {
        this.isLoading = true;
        
        // 添加用户消息
        const userMsg = {
          role: 'user',
          content: this.inputMessage,
          timestamp: Date.now()
        };
        this.chatHistory.push(userMsg);
        
        // 初始化AI消息
        const assistantMsg = {
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
          isStreaming: true
        };
        this.chatHistory.push(assistantMsg);
        
        // 准备对话历史
        const messages = [
          { 
            role: 'system', 
            content: '你是一名专业的电商运营专家，专注于商品运营、流量转化、活动策划、用户增长和数据分析。请用专业但易懂的方式回答电商相关问题。'
          },
          ...this.chatHistory
            .filter(msg => msg.role !== 'system')
            .map(msg => ({
              role: msg.role,
              content: msg.content
            }))
        ];
        
        // 调用阿里云百炼API
        const completion = await this.openai.chat.completions.create({
          model: "qwen-plus", // 使用通义千问模型
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000
        });
        
        // 更新AI回复
        const lastMsgIndex = this.chatHistory.length - 1;
        this.chatHistory[lastMsgIndex].content = completion.choices[0].message.content;
        this.chatHistory[lastMsgIndex].isStreaming = false;
        
        this.inputMessage = '';
        
      } catch (error) {
        console.error('API调用失败:', error);
        this.handleError(error.message);
      } finally {
        this.isLoading = false;
      }
    },

    validateTopic: debounce(function() {
      this.showTopicWarning = this.inputMessage.length > 0 && 
        !ECOMMERCE_KEYWORDS.some(kw => 
          this.inputMessage.toLowerCase().includes(kw.toLowerCase())
        );
    }, 300),

    handleError(message) {
      this.chatHistory.push({
        role: 'assistant',
        content: '服务暂时不可用',
        errorMessage: message,
        timestamp: Date.now()
      });
    },

    addWelcomeMessage() {
      this.chatHistory.push({
        role: 'assistant',
        content: '您好！我是电商运营专家，可以咨询以下问题：\n\n' +
                 '• 如何策划促销活动？\n' +
                 '• 怎样提升商品转化率？\n' +
                 '• 用户增长的有效方法\n' +
                 '• 直播带货的运营技巧',
        timestamp: Date.now()
      });
    },

    newLine() {
      this.inputMessage += '\n';
      this.$nextTick(() => this.adjustTextAreaHeight());
    },

    toggleReasoning(index) {
      this.$set(this.showReasoning, index, !this.showReasoning[index]);
    },

    formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    adjustTextAreaHeight: debounce(function() {
      const textArea = this.$refs.textArea;
      textArea.style.height = 'auto';
      textArea.style.height = `${Math.min(textArea.scrollHeight, 200)}px`;
    }, 100),

    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messageList;
        container.scrollTop = container.scrollHeight;
      });
    }
  }
}
</script>

<style lang="scss" scoped>
/* 样式保持不变，与之前相同 */
.chat-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f8fafc;
}

.welcome-banner {
  padding: 20px;
  background: #6366f1;
  color: white;
  text-align: center;
  
  h3 {
    margin: 0 0 12px;
    font-size: 20px;
  }
  
  p {
    margin: 0;
    font-size: 14px;
    opacity: 0.9;
    line-height: 1.5;
  }
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: linear-gradient(45deg, #f8f9fa, #f1f3f5);
  
  .message-item {
    margin-bottom: 20px;
    
    &.user {
      .message-card {
        margin-left: auto;
        background: #6366f1;
        color: white;
        
        .role-tag {
          background: rgba(255,255,255,0.15);
        }
        
        .time {
          color: rgba(255,255,255,0.7);
        }
      }
    }
    
    &.assistant {
      .message-card {
        margin-right: auto;
        background: white;
        border: 1px solid #e2e8f0;
      }
    }
  }
}

.message-card {
  max-width: 80%;
  min-width: 280px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  padding: 16px;
  
  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    font-size: 12px;
    
    .role-tag {
      padding: 4px 10px;
      border-radius: 4px;
      font-weight: 500;
    }
    
    .time {
      opacity: 0.7;
    }
  }
  
  .message-content {
    pre {
      white-space: pre-wrap;
      font-family: inherit;
      margin: 0;
      line-height: 1.6;
      font-size: 14px;
    }
  }
}

.error-message {
  margin-top: 10px;
  padding: 10px;
  background: #fff3f3;
  border-radius: 6px;
  color: #dc2626;
  display: flex;
  align-items: center;
  
  .icon-warning {
    margin-right: 8px;
    font-size: 14px;
  }
}

.reasoning-box {
  margin-top: 12px;
  border-top: 1px solid rgba(0,0,0,0.08);
  padding-top: 12px;
  
  .reasoning-header {
    display: flex;
    align-items: center;
    cursor: pointer;
    color: #64748b;
    font-size: 13px;
    transition: color 0.2s;
    
    &:hover {
      color: #475569;
    }
    
    .arrow {
      display: inline-block;
      width: 0;
      height: 0;
      margin-left: 8px;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      
      &.down {
        border-top: 5px solid currentColor;
      }
      
      &.up {
        border-bottom: 5px solid currentColor;
      }
    }
  }
  
  .reasoning-content {
    margin-top: 8px;
    padding: 12px;
    background: #f8fafc;
    border-radius: 8px;
    color: #475569;
    font-size: 13px;
    line-height: 1.6;
    white-space: pre-wrap;
  }
}

.input-container {
  padding: 20px;
  background: white;
  box-shadow: 0 -4px 12px rgba(0,0,0,0.04);
  
  .input-box {
    position: relative;
    display: flex;
    gap: 12px;
    align-items: flex-end;
  }
}

textarea {
  flex: 1;
  min-height: 44px;
  max-height: 200px;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  resize: none;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
  transition: all 0.2s;
  
  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    outline: none;
  }
  
  &:disabled {
    background: #f8fafc;
  }
}

.topic-warning {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  padding: 8px 12px;
  background: #fff7ed;
  color: #ea580c;
  border-radius: 6px;
  font-size: 12px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  
  .icon-info {
    margin-right: 6px;
  }
}

.send-button {
  height: 44px;
  padding: 0 24px;
  border: none;
  border-radius: 8px;
  background: #6366f1;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  
  &:hover:not(:disabled) {
    background: #4f46e5;
  }
  
  &:disabled {
    background: #e2e8f0;
    color: #94a3b8;
    cursor: not-allowed;
  }
  
  &.loading {
    padding: 0 16px;
    background: #818cf8;
  }
}

.loader {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255,255,255,0.2);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.slide-enter-active, .slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter, .slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>