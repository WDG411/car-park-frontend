<template>
  <div style="width: 50%;">
    <div class="card">
      <el-form ref="formRef" :model="data.user" label-width="80px" style="padding: 20px 30px">
        <el-form-item label="头像">
          <el-upload
              class="avatar-uploader"
              :action="baseUrl + '/files/upload'"
              :on-success="handleFileUpload"
              :show-file-list="false"
          >
            <img v-if="data.user.avatar" alt="" :src="data.user.avatar" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item prop="username" label="用户名" >
          <el-input v-model="data.user.username" disabled />
        </el-form-item>
        <el-form-item prop="name" label="姓名">
          <el-input v-model="data.user.name" />
        </el-form-item>
        <el-form-item prop="phone" label="电话">
          <el-input v-model="data.user.phone" />
        </el-form-item>
        <el-form-item prop="email" label="邮箱">
          <el-input v-model="data.user.email" />
        </el-form-item>
        <el-form-item prop="account" label="余额" v-if="data.user.role === 'USER'">
          <span style="color: red">￥{{ data.user.account }}</span>
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
import { reactive, ref } from "vue";
import request from "@/utils/request.js";
import {ElMessage} from "element-plus";
const baseUrl = import.meta.env.VITE_BASE_URL

const data = reactive({
  user:  JSON.parse(localStorage.getItem('loginUser') || '{}'),
  account: 100,
  formVisible: false,
  type: 'wei',
})

const formRef = ref()
const emit = defineEmits(["updateUser"])
const update = () => {
  let url = data.user.role === 'ADMIN' ? '/admin/update' : '/user/update'
  request.put(url, data.user).then(res => {
    if (res.code === 200) {
      ElMessage.success('更新成功')
      localStorage.setItem('loginUser', JSON.stringify(data.user))
      emit('updateUser')
    } else {
      ElMessage.success(res.msg)
    }
  })
}

const loadPerson = () => {
  let url = data.user.role === 'ADMIN' ? '/admin/selectById/' + data.user.id : '/user/selectById/' + data.user.id
  request.get(url).then(res => {
    if (res.code === 200) {
      localStorage.setItem('loginUser', JSON.stringify(res.data))
    } else {
      ElMessage.success(res.msg)
    }
  })
}
loadPerson()

const rechargeInit = () => {
  data.formVisible = true
}

const recharge = () => {
  if (data.account <= 0) {
    ElMessage.error('请输入正确的充值金额')
    return
  }
  data.user.account = parseFloat(data.user.account) + parseFloat(data.account)
  update()
  data.formVisible = false
}

const handleFileUpload = (res) => {
  data.user.avatar = res.data
}
</script>

<style scoped>
.avatar-uploader .avatar {
  width: 120px;
  height: 120px;
  display: block;
}
</style>

<style>
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