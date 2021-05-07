<template>
  <el-container class="home_container">
    <!--  头部区域  -->
    <el-header>
      <div>
        <img src="~assets/img/logo.png">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!--  主体区域  -->
    <el-container>
      <!--  侧边栏  -->
      <el-aside :width="collapseWidth">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!--   侧边栏菜单区域    -->
        <el-menu background-color="#5e6871" text-color="#fff"
                 active-text-color="#409EEF" :unique-opened="true"
                 :collapse="isCollapse" :collapse-transition="false"
                 :router="true" :default-active="defaultMenuIndex">
          <!--  一级菜单  -->
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!--  二级菜单  -->
            <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>

        </el-menu>
      </el-aside>
      <!--  右侧区域  -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>

  </el-container>

</template>

<script>
  export default {
    name: "Home",
    data() {
      return {
        menuList: [],
        iconsObj: {
          '125': 'iconfont icon-users',
          '103': 'iconfont icon-tijikongjian',
          '101': 'iconfont icon-shangpin',
          '102': 'iconfont icon-danju',
          '145': 'iconfont icon-baobiao'
        },
        isCollapse: false
      }
    },
    created() {
      this.getMenuList()
    },
    computed: {
      collapseWidth() {
        return this.isCollapse? '64px' : '200px'
      },
      defaultMenuIndex() {
        return this.$route.path
      }
    },
    methods: {
      logout() {
        window.sessionStorage.clear()
        this.$router.push('/login')
      },
      //获取所有菜单
      async getMenuList() {
        const {data: res} = await this.$http.get('menus')
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.menuList = res.data
        console.log(res);
      },
      //点击按钮切换菜单折叠展开
      toggleCollapse() {
        this.isCollapse = !this.isCollapse
      }
    }
  }
</script>

<style scoped>
  .home_container {
    height: 100%;
  }

  .el-header {
    background-color: #495158;
    display: flex;
    justify-content: space-between;
    padding: 0;
    color: #eee;
    font-size: 22px;
  }

  .el-header img {
    width: 20%;
  }

  .el-header div {
    display: flex;
    align-items: center;
  }

  .el-header div span {
    margin-left: 15px;
  }

  .el-aside {
    background-color: #5e6871;
    color: #333;
    text-align: center;
    line-height: 200px;
    transition: .5s;
  }

  .el-aside .el-menu {
    border-right: 0;
  }

  .el-main {
    background-color: #E9EEF3;
    color: #333;
    text-align: center;
    line-height: 160px;
  }

  .iconfont {
    margin-right: 10px;
  }

  .toggle-button {
    background-color: #717a98;
    font-size: 10px;
    line-height: 26px;
    color: #eee;
    letter-spacing: 0.25em;
    cursor: pointer;
  }

</style>