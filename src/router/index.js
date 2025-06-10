import {createRouter, createWebHistory} from "vue-router";
import LoginView from '../views/Login.vue';
import NotFoundView from '../views/404.vue';
import LayoutView from '../views/Layout.vue';
import {getRouterApi} from "@/api/login.js";

const routes = [
    { path: '', redirect: '/login'},
    { path: '/', redirect: '/login' },
    { path: '/login', component: LoginView  },

    // 动态挂载路由 - 主布局
    {
        path: '/home',
        name: 'Home',
        component: LayoutView,
        redirect: '/index',
        children: []
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 标记动态路由是否已加载
let dynamicRoutesLoaded = false;

// 路由拦截
router.beforeEach(async (to, from, next) => {
    if (to.path === '/login') {
        next();
    } else {
        // 如果动态路由未加载，先加载路由
        if (!dynamicRoutesLoaded) {
            const res = await getRouterApi();
            if (res.code === 200) {
                let addDynamicRoutes = dynamicRoutes(res.data);
                router.addRoute(addDynamicRoutes);
                dynamicRoutesLoaded = true;

                // 添加404路由和重定向路由
                router.addRoute({ path: '/404', component: NotFoundView })
                router.addRoute({ path: '/:pathMatch(.*)*', redirect: '/404' });

                let homeRoute = router.getRoutes().find(r => r.name === 'Home');
                console.log('动态路由：', homeRoute);
                // 重新导航到目标路由
                next({...to, replace: true});
                console.log('重新导航到目标路由：', to);
                return;
            }
        }
        next();
    }
})


function dynamicRoutes(data) {
    let HomeRoute = routes.filter(v=>v.path==='/home')[0];

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
