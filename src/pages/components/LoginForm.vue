<template>
  <form @submit.prevent="handleSubmit" class="login-form">
    <div class="form-froup">
      <label for="email">邮箱</label>
      <input
        id="email"
        v-model="form.email"
        type="email"
        :class="['form-input', { error: errors.email }]"
        @blur="validateField('email')"
      />
      <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
    </div>

    <div class="form-group">
      <label for="password">密码</label>
      <input
        id="password"
        v-model="form.password"
        type="password"
        :class="['form-input', { error: errors.password }]"
        @blur="validateField('password')"
      />
      <span v-if="errors.password" class="error-message">{{
        errors.password
      }}</span>
    </div>

    <BaseButton type="primary" :disabled="!isFormValid || loading">
      {{ loading ? '登录中...' : '登录' }}
    </BaseButton>

    <div v-if="submitError" class="submit-error">{{ submitError }}</div>
  </form>
</template>
<script setup>
import BaseButton from './BaseButton.vue';

// 表单数据
const form = reactive({
  email: '',
  password: '',
});

// 错误信息
const errors = reactive({
  email: '',
  password: '',
});

// 加载状态和提交错误
const loading = ref(false);
const submitError = ref('');

// 计算表单是否有效
const isFormValid = computed(() => {
  return form.email && form.password && !errors.email && !errors.password;
});

// 字段校验规则
const validationRules = {
  email: (value) => {
    if (!value) return '邮箱不能为空';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return '邮箱格式不正确';
    return '';
  },
  password: (value) => {
    if (!value) return '密码不能为空';
    if (value.length < 6) return '密码至少6位';
    return '';
  },
};

// 验证单个字段
const validateField = (fieldName) => {
  const value = form[fieldName];
  errors[fieldName] = validationRules[fieldName](value);
};

// 提交表单
const emit = defineEmits(['success']);

const handleSubmit = async () => {
  // 校验所有字段
  Object.keys(form).forEach((field) => validateField(field));

  // 如果有错误就不提交
  if (Object.values(errors).some((error) => error)) return;

  loading.value = true;
  submitError.value = '';

  try {
    // 模拟api调用
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 模拟随机失败
    const randomValue = Math.random();
    console.log(randomValue);
    if (randomValue > 0.5) {
      emit('success', { email: form.email });
    } else {
      throw new Error('登录失败，请检查邮箱和密码');
    }
  } catch (error) {
    submitError.value = error.message;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1rem;
}

.form-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-input.error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
}

.submit-btn {
  width: 100%;
  margin-top: 1rem;
}

.submit-error {
  margin-top: 1rem;
  padding: 8px;
  background: #f8d7da;
  color: #721c24;
  border-radius: 4px;
}
</style>
