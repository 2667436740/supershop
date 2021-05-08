<template>
  <div>
    <!--  面包屑导航区域  -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--  卡片视图区域  -->
    <el-card>
      <!--  添加角色按钮区域    -->
      <el-row>
        <el-col :span="4">
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>

      <!--   角色列表区域   -->
      <el-table :data="roleList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bd-bottom', i1 === 0 ? 'bd-top': '', 'v-center']"
                    v-for="(item1, i1) in scope.row.children" :key="item1.id">
              <!--  渲染一级权限  -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--  渲染二级三级区域 -->
              <el-col :span="19">
                <el-row :class="[ i2 === 0 ? '': 'bd-top', 'v-center']"
                        v-for="(item2, i2) in item1.children" :key="item2.id">
                  <!--  渲染二级权限  -->
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!--  渲染三级权限  -->
                  <el-col :span="18">
                    <el-tag v-for="(item3,i3) in item2.children" :key="item3.id" type="warning"
                            closable @close="removeRightById(scope.row, item3.id)">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting"
                      @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!--  分配权限的对话框  -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%">
      <!--   树形控件   -->
      <el-tree :data="rightsList" :props="treeProps" node-key="id" show-checkbox
               :default-expand-all="true" :default-checked-keys="defKeys"
                ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
  export default {
    name: "Roles",
    data() {
      return {
        //所有角色列表数据
        roleList: [],
        setRightDialogVisible: false,
        //所有权限的数据
        rightsList: [],
        //树形控件的属性绑定对象
        treeProps: {
          label: 'authName',
          children: 'children'
        },
        //默认选中的节点Id值数组
        defKeys: [],
        //当前即将分配权限的角色Id
        roleId: ''
      }
    },
    created() {
      this.getRoleList()
    },
    methods: {
      async getRoleList() {
        const {data: res} = await this.$http.get('roles')
        if (res.meta.status !== 200) {
          return this.$message.error('获取角色列表失败')
        }
        this.roleList = res.data
        console.log(this.roleList);
      },
      //根据Id删除对应的权限
      async removeRightById(role, rightId) {
        const confirmResult =  await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if (confirmResult !== 'confirm') {
          return this.$message.info('取消了删除')
        }
        const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if (res.meta.status !== 200) {
          return this.$message.error('删除权限失败!')
        }
        // this.getRoleList()
        role.children = res.data
      },
      //展示分配权限的对话框
      async showSetRightDialog(role) {
        //打开对话框前重置defKeys数组
        this.defKeys = []

        this.roleId = role.id

        //获取所有权限的数据
        const {data: res} = await this.$http.get(`rights/tree`)
        if (res.meta.status !== 200) {
          return this.$message.error('获取权限数据失败')
        }
        this.rightsList = res.data
        console.log(this.rightsList);

        //递归获取三级节点的Id
        this.getLeafKeys(role,this.defKeys)

        this.setRightDialogVisible = true
      },
      //通过 递归 的形式，获取角色下所有三级权限Id
      //并保存在数组中
      getLeafKeys(node,arr) {
        //如果当前 node 节点不包含children属性, 则是三级节点
        if (!node.children) {
          return arr.push(node.id)
        }

        node.children.forEach(item => this.getLeafKeys(item,arr))
      },
      //点击为角色分配权限
      async allotRights() {
        const keys = [
          ...this.$refs.treeRef.getCheckedKeys(),
          ...this.$refs.treeRef.getHalfCheckedKeys()
        ]

        const idStr = keys.join(',')
        const {data: res} = await this.$http.post(
            `roles/${this.roleId}/rights`,{rids: idStr})

        if (res.meta.status !== 200) {
          return this.$message.error('分配权限失败!')
        }
        this.$message.success('分配权限成功!')
        this.getRoleList()
        this.setRightDialogVisible = false
      }
    }
  }
</script>

<style scoped>
  .el-row .el-col {
    line-height: 50px;
  }

  .bd-top {
    border-top: 1px solid #eee;
  }

  .bd-bottom {
    border-bottom: 1px solid #eee;
  }

  .v-center {
    display: flex;
    align-items: center;
  }
</style>