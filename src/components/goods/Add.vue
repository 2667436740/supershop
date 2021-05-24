<template>
  <div>
    <!--  面包屑导航区域  -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!--  卡片视图区域  -->
    <el-card>
      <!--   提示区   -->
      <el-alert title="添加商品信息" type="info"
              center show-icon>
      </el-alert>
      <!--   步骤条   -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!--   tab栏区域   -->
      <el-form :model="addForm" :rules="addFormRules"
               ref="addFormRef" label-width="100px" label-position="top">
        <el-tabs :tab-position="'left'" v-model="activeIndex"
                 :before-leave="beforeTabLeave" @tab-click="tabClick">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="addForm.goods_cat" :options="cateList"
                      :props="{ expandTrigger: 'hover', label: 'cat_name',
                               value: 'cat_id', children: 'children'}"
                      @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!--  渲染表单的item项   -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData"
                          :key="item.attr_id">
              <!--  复选框组   -->
              <el-checkbox-group v-model="item.attr_checked_vals">
                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals"
                             :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <!--  渲染表单的item项   -->
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData"
                          :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
                    :action="uploadURL"
                    :on-preview="handlePreview"
                    :on-remove="handleRemove"
                    list-type="picture"
                    :headers="headerObj"
                    :on-success="handleSuccess"	>
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!--  图片预览  -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
  import _ from 'lodash'

  export default {
    name: "Add",
    data() {
      return {
        activeIndex: '0',
        //添加表单的数据对象
        addForm: {
          goods_name: '',
          goods_price: 0,
          goods_weight: 0,
          goods_number: 0,
          goods_cat: [],
          pics: [],
          goods_introduce: '',
          attrs: []
        },
        addFormRules: {
          goods_name: [
            { required: true, message: '请输入商品名称', trigger: 'blur' }
          ],
          goods_price: [
            { required: true, message: '请输入商品价格', trigger: 'blur' }
          ],
          goods_weight: [
            { required: true, message: '请输入商品重量', trigger: 'blur' }
          ],
          goods_number: [
            { required: true, message: '请输入商品数量', trigger: 'blur' }
          ],
          goods_cat: [
            { required: true, message: '请选择商品分类', trigger: 'blur' }
          ]
        },
        //商品分类列表
        cateList: [],
        //动态参数列表数据
        manyTableData: [],
        //静态属性列表数据
        onlyTableData: [],
        uploadURL: "http://127.0.0.1:8888/api/private/v1/upload",
        //图片上传组件的headers请求头对象
        headerObj: {
          Authorization: window.sessionStorage.getItem('token')
        },
        previewPath: '',
        previewVisible: false
      }
    },
    created() {
      this.getCateList()
    },
    computed: {
      cateId() {
        if (this.addForm.goods_cat.length === 3) {
          return this.addForm.goods_cat[2]
        }
        return null
      }
    },
    methods: {
      async getCateList() {
        const {data: res} = await this.$http.get(`categories`)
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品分类数据失败!')
        }
        this.cateList = res.data
        console.log(this.cateList);
      },
      //级联选择器选中项变化，会触发
      handleChange() {
        console.log(this.addForm.goods_cat);
        if (this.addForm.goods_cat.length !== 3) {
          this.addForm.goods_cat = []
        }
      },
      beforeTabLeave(activeName,oldActiveName) {
        if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
          this.$message.error('请先选择商品分类!')
          return false
        }
      },
      async tabClick() {
        //证明访问的是 动态参数\静态属性 面板
        if (this.activeIndex === '1') {
          const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`,
              {params: {sel: 'many'}})
          if (res.meta.status !== 200) {
            return this.$message.error('获取动态参数失败!')
          }
          console.log(res.data);
          res.data.forEach(item => {
            item.attr_vals =
                item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
            // 解决复选框点击消失的问题
            item.attr_checked_vals = [...item.attr_vals]
          })
          this.manyTableData = res.data
        }
        else if (this.activeIndex === '2') {
          const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`,
              {params: {sel: 'only'}})
          if (res.meta.status !== 200) {
            return this.$message.error('获取静态属性失败!')
          }
          console.log(res.data);
          this.onlyTableData = res.data
        }
      },
      //图片预览
      handlePreview(file) {
        this.previewPath = file.response.data.url
        this.previewVisible = true
      },
      //图片移除
      handleRemove(file) {
        //1.获取将要删除的图片的临时路径
        const filePath = file.response.data.tmp_path
        //2.从pics数组中，找到图片对应的索引值
        const i = this.addForm.pics.findIndex(x =>
          x.pic === filePath)
        //3.移除
        this.addForm.pics.splice(i,1)
        console.log(this.addForm);
      },
      //监听图片上传成功的事件
      handleSuccess(response) {
        console.log(response);
        //1.拼接得到一个图片信息对象
        const picInfo = { pic: response.data.tmp_path}
        //2.将图片信息对象，push到pics数组中
        this.addForm.pics.push(picInfo)
        console.log(this.addForm);
      },
      add() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) {
            return this.$message.error('请填写必要的表单项!')
          }
          //lodash cloneDeep 深拷贝
          const form = _.cloneDeep(this.addForm)
          form.goods_cat = form.goods_cat.join(',')
          //处理动态参数
          this.manyTableData.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_checked_vals.join(',')
            }
            console.log(newInfo);
            this.addForm.attrs.push(newInfo)
          })
          //处理静态属性
          this.onlyTableData.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals
            }
            this.addForm.attrs.push(newInfo)
          })
          form.attrs = this.addForm.attrs
          console.log(form);

          const {data: res} = await this.$http.post('goods', form)
          if (res.meta.status !== 201) {
            return this.$message.error('添加商品失败!')
          }
          this.$message.success('添加商品成功!')
          this.$router.push('/goods')
        })
      }
    }
  }
</script>

<style scoped>
  .el-alert {
    line-height: 30px;
  }

  .el-steps {
    line-height: 20px;
    width: 100%;
    text-align: start;
    margin: 10px;
  }

  ::v-deep .el-steps .el-step__title {
    font-size: 10px;
  }

  .el-form .el-form-item {
    line-height: 50px;
    text-align: start;
  }

  .el-checkbox {
    margin: 0 10px 0 0!important;
  }

  .el-tab-pane {
    line-height: 100%;
  }

  .previewImg {
    width: 100%;
  }

  .el-button {
    float: left;
    margin-top: 15px;
  }
</style>