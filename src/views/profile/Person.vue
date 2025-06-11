<template>
  <div style="width: 50%;">
    <div class="card">
      <el-form ref="formRef" :model="userStore.user" label-width="80px" style="padding: 20px 30px">
        <el-form-item label="头像">
          <el-upload
              class="avatar-uploader"
              :action="baseUrl + '/files/upload'"
              :on-success="handleFileUpload"
              :show-file-list="false"
          >
            <img v-if="userStore.user.avatar" alt="" :src="userStore.user.avatar" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item prop="username" label="用户名">
          <el-input v-model="userStore.user.username" disabled />
        </el-form-item>
        <el-form-item prop="nickName" label="昵称">
          <el-input v-model="userStore.user.nickName" />
        </el-form-item>
        <el-form-item prop="phone" label="电话">
          <el-input v-model="userStore.user.phone" />
        </el-form-item>
        <el-form-item prop="email" label="邮箱">
          <el-input v-model="userStore.user.email" />
        </el-form-item>
        <el-form-item prop="account" label="余额" v-if="userStore.user.roleList.includes('USER')">
          <span style="color: red">￥{{ userStore.user.account }}</span>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="update">保 存</el-button>
          <el-button type="warning" @click="rechargeInit">充 值</el-button>
        </el-form-item>
      </el-form>
    </div>
    <el-dialog title="个人充值" v-model="data.formVisible" width="40%" :close-on-click-modal="false" destroy-on-close>
      <el-form label-width="80px" style="padding: 20px 30px" ref="formRef">
        <el-form-item label="充值金额" prop="account">
          <el-input v-model="data.account" placeholder="请输入充值金额"></el-input>
        </el-form-item>
        <el-form-item label="支付方式" prop="type">
          <el-radio-group v-model="data.type" size="large">
            <el-radio-button label="微信" value="wei" />
            <el-radio-button label="支付宝" value="ali" />
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="data.formVisible = false">取消</el-button>
          <el-button type="primary" @click="recharge">充值</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import request from '@/utils/request.js'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const baseUrl = import.meta.env.VITE_BASE_URL
const userStore = useUserStore()

const data = reactive({
  account: 100,
  formVisible: false,
  type: 'wei'
})

const formRef = ref()

// 更新用户信息
const update = async () => {
  try {
    const url = '/allUser/update'
    const res = await request.put(url, userStore.user)
    if (res.code === 200) {
      ElMessage.success('更新成功')
      // 更新 Pinia 状态
      userStore.setUser({ ...userStore.user })
    } else {
      ElMessage.error(res.msg)
    }
  } catch (error) {
    ElMessage.error('更新失败')
  }
}

// 加载用户信息
const loadPerson = async () => {
  try {
    const url = '/allUser/selectById/' + userStore.user.id
    const res = await request.get(url)
    if (res.code === 200) {
      // 会导致token消失
      //userStore.setUser(res.data)
    } else {
      ElMessage.error(res.msg)
    }
  } catch (error) {
    ElMessage.error('获取用户信息失败')
  }
}

onMounted(() => {
  loadPerson()
})

// 充值
const rechargeInit = () => {
  data.formVisible = true
}

const recharge = () => {
  if (data.account <= 0) {
    ElMessage.error('请输入正确的充值金额')
    return
  }
  // 以分为单位安全运算
  const newAccount = parseFloat(userStore.user.account) + parseFloat(data.account)
  userStore.user.account = newAccount
  update()
  data.formVisible = false
}

// 上传头像成功处理
const handleFileUpload = (res) => {
  userStore.user.avatar = res.data
}
</script>

<style scoped>
.avatar-uploader .avatar {
  width: 120px;
  height: 120px;
  display: block;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  text-align: center;
}
</style>
