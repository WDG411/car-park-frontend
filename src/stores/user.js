import { defineStore } from 'pinia'
import { ref } from 'vue'


export const useUserStore = defineStore('user', () => {
    // state：存放当前用户信息
    const userInfo = ref(
        JSON.parse(localStorage.getItem('loginUser') || '{}')
    )

    // action：更新用户信息
    function setUser(newUser) {
        userInfo.value = newUser
        // 同步到 localStorage
        localStorage.setItem('loginUser', JSON.stringify(newUser))
    }

    function setUserInfo(newUserInfo) {
        userInfo.value.username = newUserInfo.username
        userInfo.value.email = newUserInfo.email
        userInfo.value.phone = newUserInfo.phone
        userInfo.value.avatar = newUserInfo.avatar
        userInfo.value.nickName = newUserInfo.nickName
    }


    return {
        userInfo,
        setUser,
        setUserInfo
    }
})
