<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  reactive,
  ref,
} from "@vue/runtime-core";
import { ArrowLeftBold } from "@element-plus/icons-vue";
import { useRouter, useRoute } from "vue-router";
import type { ElInput } from "element-plus";
import { IMainData, ITabData } from "../types";
import { Close } from "@element-plus/icons-vue";

let detailName = ref<string>("");
let inputShow = ref<boolean>(true);
let mainData = reactive<{ data: IMainData[] }>({ data: [] });
let detailData = reactive<{ data: ITabData[] }>({ data: [] });
let choiceDelArr = reactive<{ num: number[] }>({ num: [] });
let testdata = ref<string>("");
let jijinId = ref<string>("");
let InputRef = ref<InstanceType<typeof ElInput>>();

const router: any = useRouter();
const route: any = useRoute();
onMounted(() => {
  // web页面开发环境下获取不到 chrome，为了防止之后的运行错误，使用 try catch 捕获错误
  try {
    // @ts-ignore
    chrome.storage.sync.get("data", ({ data }) => {
      if (data) {
        // tips：从chrome.storage中取出的数据一律为 JSON 格式，因此将对象内的数据都存到数组中去
        for (let index in data) {
          mainData.data.push(data[index]);
        }
        // 获取集锦内的children信息
        for (let i = 0; i < mainData.data.length; i++) {
          if (route.query.id == mainData.data[i].id) {
            for (let index in mainData.data[i].children) {
              detailData.data.push(mainData.data[i].children[index]);
            }
            break;
          }
        }
      } else {
        mainData.data = [];
      }
    });
  } catch (err) {
    console.log(err);
  }
  // 获取路由query参数 用于判断是哪个集锦
  jijinId.value = route.query.id;
  detailName.value = route.query.name;
});

// 回到集锦页面
const goMain = () => {
  router.push("/main");
};

// 点击开启 改变集锦名称模式
const changeInputShow = () => {
  inputShow.value = false;
  nextTick(() => {
    InputRef.value!.input!.focus();
  });
};

// 更新集锦名称
const changeDetailName = () => {
  mainData.data.forEach((item) => {
    if (item.id == route.query.id) {
      item.name = detailName.value;
    }
  });
  try {
    // @ts-ignore
    chrome.storage.sync.set({ data: mainData.data });
  } catch (err) {
    console.log(err);
  }
  inputShow.value = true;
};

// 获取tab页面的数据并且添加
const getTabData = async () => {
  try {
    // 获取tab页面的数据
    // @ts-ignore
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    // 添加tab页面
    let id: number = 1;
    if (detailData.data.length) {
      id = detailData.data[detailData.data.length - 1].cId + 1;
    }
    detailData.data.push({
      cId: id,
      title: tab.title,
      url: tab.url,
      img_url: "...",
      icon_url: tab.favIconUrl,
    });

    // detailData.data.push({
    //   cId: 1,
    //   title: "测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试",
    //   url: "测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试测试",
    //   img_url: "...",
    //   icon_url: "...",
    // });

    // 将tab页面的数据加入集锦之中
    mainData.data.forEach((item) => {
      if (item.id == route.query.id) {
        item.children = detailData.data;
      }
    });

    // 更新 chrome.storage
    // @ts-ignore
    chrome.storage.sync.set({ data: mainData.data });
  } catch (err) {
    console.log(err);
  }
};

// 点击tab 利用 window.open进行页面跳转
const goUrl = (url: string) => {
  // window.open 打开新标签页
  window.open(url);
};

// 计算有几个需要删除、控制删除框的出现
let delDetailShow = computed(() => {
  let flag: number = 0;
  detailData.data.forEach((item) => {
    if (item.choice_del === true) {
      flag++;
    }
  });
  return flag;
});

// 选中要删除的tab页面
const choiceDelTab = (index: number) => {
  console.log(index);
  choiceDelArr.num.push(index);
};

const cancelDel = () => {
  detailData.data.forEach((item) => {
    item.choice_del = false;
  });
  choiceDelArr.num = [];
};

// 确认删除
const sureDel = () => {
  let newData: any[] = [];
  choiceDelArr.num = [...new Set(choiceDelArr.num)];
  detailData.data.forEach((item) => {
    if (!choiceDelArr.num.includes(item.cId)) {
      newData.push(item);
    }
  });
  detailData.data = newData;
  choiceDelArr.num = [];

  // 将tab页面的数据加入集锦之中
  mainData.data.forEach((item) => {
    if (item.id == route.query.id) {
      item.children = detailData.data;
    }
  });

  // 更新数据
  try {
    //@ts-ignore
    chrome.storage.sync.set({ data: mainData.data });
  } catch (err) {
    console.log(err);
  }
};
</script>

<template>
  <div id="detail">
    <header>
      <div class="header-top">
        <el-icon @click="goMain">
          <arrow-left-bold />
        </el-icon>
        <div v-if="inputShow" class="collection-name" @click="changeInputShow">
          {{ detailName }}
        </div>
        <el-input
          v-else
          ref="InputRef"
          v-model="detailName"
          class="ml-1 w-20"
          @keyup.enter="changeDetailName"
          @blur="changeDetailName"
        ></el-input>
      </div>
      <span @click="getTabData" class="addDetail">+ 添加当前页面</span>
      <div class="delDetail" v-if="delDetailShow">
        <div>
          <el-button :icon="Close" size="small" @click="cancelDel"></el-button>
          <span>{{ delDetailShow }}项已选择</span>
        </div>
        <el-button size="small" @click="sureDel">删除</el-button>
      </div>
    </header>

    <main>
      <div
        v-for="item in detailData.data"
        :key="item.cId"
        :class="['tabs', { typeA: item.choice_del }]"
        @click="goUrl(item.url)"
      >
        <div class="collection-detail">
          <div class="title">{{ item.title }}</div>
          <div class="url">{{ item.url }}</div>
        </div>
        <div class="img"></div>
        <el-checkbox
          @click.stop="choiceDelTab(item.cId)"
          size="large"
          v-model="item.choice_del"
        ></el-checkbox>
      </div>
      <div>当前集锦：{{ jijinId }}</div>
    </main>
  </div>
</template>

<style scoped lang="less">
#detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  header {
    position: relative;
    padding: 5px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    .header-top {
      display: flex;
      align-items: center;
      i {
        box-sizing: content-box;
        padding: 5px;
        &:hover {
          background-color: rgb(229, 229, 229);
          cursor: pointer;
        }
      }
      .collection-name {
        font-weight: 700;
        flex: 1;
        margin-left: 5px;
        padding: 5px 0;
        &:hover {
          background-color: rgb(229, 229, 229);
          cursor: pointer;
        }
      }
      .el-input {
        height: 31px;
        margin-left: 5px;
      }
    }
    .addDetail {
      font-size: 14px;
      font-weight: 700;
      margin-left: 5px;
      margin-bottom: 6px;
      display: inline-block;
      color: rgb(10, 139, 238);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      &:hover {
        border-bottom: 2px solid rgb(10, 139, 238);
      }
    }
    .delDetail {
      position: absolute;
      bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 298px;
      font-size: 14px;
      font-weight: 400;
      background-color: rgb(84, 84, 84);
      color: white;
      .el-button {
        background-color: rgb(84, 84, 84);
        border: none;
        color: white;
        &:hover {
          background-color: rgb(97, 97, 97);
        }
      }
    }
  }
  main {
    flex: 1;
    overflow-y: auto;

    .tabs {
      position: relative;
      display: flex;
      justify-content: space-between;
      margin: 5px 10px 0;
      padding: 5px;
      height: 76px;
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 5px;
      transition: 0.5s box-shadow;
      &:hover {
        box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.5);
        .el-checkbox {
          display: flex;
        }
      }
      .collection-detail {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        .title,
        .url {
          max-width: 180px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .title {
          font-weight: 700;
        }
        &:hover .title {
          border-bottom: 1px solid black;
        }
      }
      .img {
        height: 100%;
        width: 80px;
        background-color: red;
      }
      .el-checkbox {
        position: absolute;
        display: none;
        right: 6px;
        top: -6px;
      }
    }

    .typeA {
      padding: 4px !important;
      border: 2px solid rgb(0, 120, 212) !important;
      box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.5) !important;

      .el-checkbox {
        display: flex !important;
        right: 5px !important;
        top: -7px !important;
      }
    }
  }
}
</style>
