<template>


  <div class="common-layout">
    <el-container>
      <el-header>
        <div class="header-content">
          <h1>动态路由</h1>
          <el-button @click="logout" type="danger" plain>退出登录</el-button>
        </div>
      </el-header>

      <el-container>
        <!-- 菜单栏 -->
        <el-aside width="200px">
          <el-scrollbar>
            <el-menu router default-active="/index">
              <div v-for="menu in menuTree" :key="menu.path">
                <el-menu-item :index="menu.path" v-if="!menu.children || menu.children.length === 0 && menu.menuType==='MENU'">
                  <template #title>
                    {{ menu.menuName }}
                  </template>
                </el-menu-item>

                <el-sub-menu :index="menu.path" v-else-if="menu.children.length > 0 && menu.menuType==='MENU'">
                  <template #title>
                    {{ menu.menuName }}
                  </template>
                  <el-menu-item :index="child.path" v-for="child in menu.children" :key="child.path">
                    {{ child.menuName }}
                  </el-menu-item>
                </el-sub-menu>
              </div>
            </el-menu>
          </el-scrollbar>
        </el-aside>

        <!-- 内容展示 -->
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getRouterApi } from "@/api/login.js";
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const router = useRouter();
const menuTree = ref([])

const getMenuTree = async () => {
  try {
    const res = await getRouterApi();
    if (res.code === 200) {
      menuTree.value = res.data;
    }
  } catch (error) {
    console.error('获取菜单树失败:', error);
    ElMessage.error('获取菜单失败');
  }
}

const logout = () => {
  localStorage.removeItem('loginUser');
  ElMessage.success('已退出登录');
  router.push('/login');
}

onMounted(() => {
  getMenuTree()
})
</script>

<style scoped>
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.common-layout {
  height: 100vh;
}

.el-header {
  background-color: #409eff;
  color: white;
}

.el-aside {
  background-color: #f5f5f5;
}
</style>