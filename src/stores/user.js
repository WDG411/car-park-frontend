import { defineStore } from 'pinia'
import { ref } from 'vue'

// 定义一个 user Store，id 为 'user'
export const useUserStore = defineStore('user', () => {
    // state：存放当前用户信息
    const user = ref(
        JSON.parse(localStorage.getItem('loginUser') || '{}')
    )

    // action：更新用户信息
    function setUser(newUser) {
        user.value = newUser
        // 同步到 localStorage
        localStorage.setItem('loginUser', JSON.stringify(newUser))
    }

    return {
        user,
        setUser
    }
})
