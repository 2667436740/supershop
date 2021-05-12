<template>
  <div>
    <!--  面包屑导航区域  -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!--  卡片视图区域  -->
    <el-card>
      <!--  按钮区域  -->
      <el-row>
        <el-col :span="2">
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!--  表格区域  -->
      <tree-table :data="cateList" :columns="columns"
                  :expand-type="false" :selection-type="false"
                  :show-index="true" border>
        <!--    是否有效    -->
        <template slot="isOk" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted ===false"
            style="color: lightgreen"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!--    排序    -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!--    操作   -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>

      <!--  分页区域  -->
      <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="queryInfo.pagenum"
              :page-sizes="[3, 5, 10, 15]"
              :page-size="queryInfo.pagesize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
      </el-pagination>
    </el-card>

    <!--  添加分类的对话框  -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%"
               @close="addCateDialogClosed">
      <!--  添加分类的表单  -->
      <el-form :model="addCateForm" :rules="addCateFormRules"
               ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <el-cascader v-model="selectedKeys" :options="parentCateList"
                  :props="{ expandTrigger: 'hover',value: 'cat_id',label: 'cat_name',children: 'children',checkStrictly: 'true'}"
                   @change="parentCateChange" clearable></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "Cate",
    data() {
      return {
        //查询条件
        queryInfo: {
          type: 3,
          pagenum: 1,
          pagesize: 5
        },
        cateList: [],
        total: 0,
        //为table指定列的定义
        columns: [
          {
            label: '分类名称',
            prop: 'cat_name'
          },
          {
            label: '是否有效',
            //当前列定义为模板列
            type: 'template',
            //模板名称
            template: 'isOk'
          },
          {
            label: '排序',
            //当前列定义为模板列
            type: 'template',
            //模板名称
            template: 'order'
          },
          {
            label: '操作',
            //当前列定义为模板列
            type: 'template',
            //模板名称
            template: 'opt'
          }
        ],
        addCateDialogVisible: false,
        addCateForm: {
          //将要添加的分类的名称
          cat_name: '',
          //父级分类的Id
          cat_pid: 0,
          //分类的等级，默认添加一级分类
          cat_level: 0
        },
        addCateFormRules: {
          cat_name: [
            { required: true, message: '请输入分类名称', trigger: 'blur' }
          ]
        },
        //父级分类的列表
        parentCateList: [],
        //选中的父级分类的Id数组
        selectedKeys: []
      }
    },
    created() {
      this.getCateList()
    },
    methods: {
      async getCateList() {
        const {data: res} = await this.$http.get('categories',{params: this.queryInfo})
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品分类失败！')
        }
        console.log(res.data);
        //数据列表赋值给 cateList
        this.cateList = res.data.result
        //为总数据条数赋值
        this.total = res.data.total
      },
      //监听pagesize改变的事件
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        this.getCateList()
      },
      //监听pagenum改变的事件
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
        this.getCateList()
      },
      showAddCateDialog() {
        //先获取父级分类的数据列表
        this.getParentCateList()
        this.addCateDialogVisible = true
      },
      //获取父级分类的数据列表
      async getParentCateList() {
        const {data: res} = await this.$http.get('categories',{params: {type: 2}})
        if (res.meta.status !== 200) {
          return this.$message.error('获取数据失败!')
        }
        console.log(res.data);
        this.parentCateList = res.data
      },
      //选择项发生变化触发这个函数
      parentCateChange() {
        console.log(this.selectedKeys);
        //如果 selectedKeys 数组中 length>0 ，证明选中
        //反之，没选中任何
        if (this.selectedKeys.length > 0) {
          this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
          this.addCateForm.cat_level = this.selectedKeys.length
          return
        } else {
          this.addCateForm.cat_pid = 0
          this.addCateForm.cat_level = 0
        }
      },
      //点击按钮，添加新分类
      addCate() {
        this.$refs.addCateFormRef.validate(async valid => {
          if (!valid) return
          const {data: res} = await this.$http.post('categories',this.addCateForm)
          if (res.meta.status !== 201) {
            return this.$message.error('添加分类失败！')
          }
          this.$message.success('添加分类成功！')
          this.getCateList()
          this.addCateDialogVisible = false
        })

      },
      //监听对话框的关闭事件，重置表单
      addCateDialogClosed() {
        this.$refs.addCateFormRef.resetFields()
        this.selectedKeys = []
        this.addCateForm.cat_level = 0
        this.addCateForm.cat_pid = 0
      }
    }
  }
</script>

<style scoped>
  .el-row .el-col {
    line-height: 100px;
  }

  .el-form .el-form-item .el-cascader {
    float: left;
    width: 100%;
  }
</style>