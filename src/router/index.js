import {createRouter, createWebHistory} from "vue-router";
import LoginView from '../views/Login.vue';
import NotFoundView from '../views/404.vue';
import LayoutView from '../views/Layout.vue';
import {getRouterApi} from "@/api/login.js";
import PersonView from '../views/profile/Person.vue';
import PasswordView from '../views/profile/Password.vue';
import {useUserStore} from "@/stores/user.js";


const routes = [
    {path: '', redirect: '/login'},
    {path: '/', redirect: '/login'},
    {path: '/login', component: LoginView},


    // 动态挂载路由 - 主布局
    {
        path: '/home',
        name: 'Home',
        component: LayoutView,
        redirect: '/index',
        children: [
            {path: '/person', component: PersonView},
            {path: '/password', component: PasswordView},
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由拦截
router.beforeEach(async (to, from, next) => {
    if (to.path === '/login') {
        next();
        return;
    }

    console.log('from:', from)
    console.log('to:', to)

    if (to.path.startsWith('/oauth2/authorization/')) {
        // 绝对后端地址
        window.location.href = 'http://localhost:8080' + to.fullPath
        return // 一定不要 next()
    }

    // 检查是否有OAuth2登录成功的Cookie（不限于特定路径）
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'loginUserVo') {
            try {
                const decoded = decodeURIComponent(value);
                const loginUserVo = JSON.parse(decoded);

                // 保存用户信息
                localStorage.setItem('loginUser', JSON.stringify(loginUserVo));
                localStorage.setItem('Token', loginUserVo.token)
                console.log(localStorage.getItem('Token'))
                console.log('OAuth2登录成功，用户信息:', loginUserVo);

                // 删除Cookie
                document.cookie = 'loginUserVo=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';

            } catch (error) {
                console.error('解析loginUserVo失败:', error);
            }
            break;
        }
    }
    const userStore = useUserStore();

    // 如果动态路由未加载，先加载路由
    if (!userStore.dynamicRoutesLoaded) {

        const res = await getRouterApi();
        if (res.code === 200) {
            let addDynamicRoutes = dynamicRoutes(res.data);
            router.addRoute(addDynamicRoutes);
            userStore.dynamicRoutesLoaded = true;

            // 添加404路由和重定向路由
            router.addRoute({path: '/404', component: NotFoundView})
            router.addRoute({path: '/:pathMatch(.*)*', redirect: '/404'});

            let homeRoute = router.getRoutes().find(r => r.name === 'Home');
            console.log('动态路由：', homeRoute);
            // 重新导航到目标路由
            next({...to, replace: true});
            console.log('重新导航到目标路由：', to);
            return;
        }
    }
    next();
})


function dynamicRoutes(data) {
    let HomeRoute = routes.filter(v => v.path === '/home')[0];

    // 处理动态路由数据
    const dynamicChildren = processMenuItems(data);
    HomeRoute.children.push(...dynamicChildren);

    return HomeRoute;
}

// 递归处理菜单项
function processMenuItems(menuItems) {
    const routeChildren = [];

    menuItems.forEach(item => {
        if (item.component) {
            // 有组件的菜单项（叶子节点）
            routeChildren.push({
                path: item.path,
                name: item.menuName,
                component: () => import(item.component),
                meta: {
                    title: item.menuName,
                    icon: item.icon,
                    visible: item.visible,
                    permission: item.permission
                }
            });
        } else if (item.children && item.children.length > 0) {
            // 有子菜单的情况，递归处理子菜单
            const childRoutes = processMenuItems(item.children);
            routeChildren.push(...childRoutes);
        }
    });

    return routeChildren;
}

export default router;
