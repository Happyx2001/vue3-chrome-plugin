<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "@vue/runtime-core";
import { useRouter } from "vue-router";
import { IMainData, ITabData } from "../types";
import { Close, Plus } from "@element-plus/icons-vue";
import html2canvas from "html2canvas";

// tips: 一个数组对象的接口可以没有对象元素
let mainData = reactive<{ data: IMainData[] }>({ data: [] });
let test = ref("");
let choiceDelArr = reactive<{ num: number[] }>({ num: [] });
let popupHashId = ref<number>(1);
let imgSrc = ref<string>("");
onMounted(() => {
  // web页面开发环境下获取不到 chrome，为了防止之后的运行错误，使用 try catch 捕获错误
  try {
    // @ts-ignore
    chrome.storage.sync.get(["data", "hashId"], ({ data, hashId }) => {
      if (data) {
        // tips：从chrome.storage中取出的数据为 JSON 格式，因此将对象内的数据遍历存到数组中去
        for (let index in data) {
          mainData.data.push(data[index]);
        }
        // 获取集锦内的children信息
        mainData.data.forEach((item) => {
          let newChild: ITabData[] = [];
          for (let index in item.children) {
            newChild.push(item.children[index]);
          }
          item.children = newChild;
        });
      } else {
        mainData.data = [];
      }

      if (hashId) {
        popupHashId.value = parseInt(hashId);
      }

      //@ts-ignore
      chrome.runtime.sendMessage({ msg: "reload" });
    });
  } catch (err) {
    // @ts-ignore
    // chrome.runtime.sendMessage({ msg: "catchErr", errMsg: err });
    console.log(err);
  }
});

const router: any = useRouter();

// 点击集锦跳转集锦内容页面
const goDetail = (id: number, name: string) => {
  router.push({
    path: "/details",
    query: {
      id,
      name,
    },
  });
};

// 启动新集锦
const addDetail = () => {
  let name: string = "新建集锦";
  mainData.data.push({
    id: popupHashId.value,
    name,
    img_url: "",
    choice_del: false,
    children: [],
  });
  popupHashId.value++;

  try {
    //@ts-ignore
    chrome.storage.sync.set({ data: mainData.data, hashId: popupHashId.value });
    //@ts-ignore
    chrome.runtime.sendMessage({ msg: "reload" });
  } catch (err) {
    // @ts-ignore
    // chrome.runtime.sendMessage({ msg: "catchErr", errMsg: err });
    console.log(err);
  }

  goDetail(--popupHashId.value, name);
};

// 计算有几个需要删除、控制删除框的出现
let delDetailShow = computed(() => {
  let flag: number = 0;
  mainData.data.forEach((item) => {
    if (item.choice_del === true) {
      flag++;
    }
  });
  return flag;
});

// 选择需要删除的集锦
const choiceIndex = (index: number) => {
  console.log(index);
  choiceDelArr.num.push(index);
};

// 取消选择删除
const cancelDel = () => {
  mainData.data.forEach((item) => {
    item.choice_del = false;
  });
  choiceDelArr.num = [];
};

// 确认删除
const sureDel = () => {
  let newData: any[] = [];
  choiceDelArr.num = [...new Set(choiceDelArr.num)];
  mainData.data.forEach((item) => {
    if (!choiceDelArr.num.includes(item.id)) {
      newData.push(item);
    }
  });
  mainData.data = newData;
  choiceDelArr.num = [];

  // 更新数据
  try {
    //@ts-ignore
    chrome.storage.sync.set({ data: mainData.data });
    //@ts-ignore
    chrome.runtime.sendMessage({ msg: "reload" });
  } catch (err) {
    // @ts-ignore
    // chrome.runtime.sendMessage({ msg: "catchErr", errMsg: err });
    console.log(err);
  }
};

const addChildren = (id: number) => {
  // @ts-ignore
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    let tab = tabs[0];
    // let imgUrl: string;

    // 将tab页面的数据加入集锦之中
    mainData.data.forEach((item) => {
      if (item.id == id) {
        item.children.push({
          cId: popupHashId.value,
          title: tab.title,
          url: tab.url,
          img_url: "...",
          icon_url: tab.favIconUrl,
        });
      }
    });
    popupHashId.value++;

    // 更新 chrome.storage
    // @ts-ignore
    chrome.storage.sync.set({
      data: mainData.data,
      hashId: popupHashId.value,
    });
    // @ts-ignore
    chrome.runtime.sendMessage({ msg: "reload" });
  });
};
</script>

<template>
  <div id="main">
    <!-- 头部 -->
    <div class="header">
      <span>集锦</span>
      <br />
      <div @click="addDetail" class="addDetail">+ 启动新集锦</div>
      <div class="delDetail" v-if="delDetailShow">
        <div>
          <el-button :icon="Close" size="small" @click="cancelDel"></el-button>
          <span>{{ delDetailShow }}项已选择</span>
        </div>
        <el-button size="small" @click="sureDel">删除</el-button>
      </div>
    </div>
    <!-- 主题内容：集锦 -->
    <div class="main-content">
      <!-- 利用动态类名 实现效果 -->
      <div
        v-for="item in mainData.data"
        :key="item.id"
        @click="goDetail(item.id, item.name)"
        :class="['collection', { typeA: item.choice_del }]"
      >
        <div class="img"></div>
        <div class="text">
          <p class="title">
            <b>{{ item.name }}</b>
          </p>
          <p class="itemNum">{{ item.children.length }}个项目</p>
        </div>
        <el-checkbox
          @click.stop="choiceIndex(item.id)"
          size="large"
          v-model="item.choice_del"
        ></el-checkbox>
        <el-button
          @click.stop="addChildren(item.id)"
          circle
          icon="Plus"
        ></el-button>
      </div>
      <div>{{ JSON.stringify(mainData.data) }}</div>
    </div>
  </div>
</template>

<style scoped lang="less">
#main {
  display: flex;
  flex-direction: column;
  height: 100%;
  .header {
    position: relative;
    font-size: 14px;
    font-weight: 700;
    padding: 10px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    .addDetail {
      display: inline-block;
      color: rgb(10, 139, 238);
      cursor: pointer;
      margin-top: 10px;
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
  .main-content {
    flex: 1;
    overflow-y: auto;
    .collection {
      position: relative;
      display: flex;
      height: 76px;
      padding: 10px;
      margin: 5px 10px 0 10px;
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 5px;
      transition: 0.5s box-shadow;
      &:hover {
        box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.5);
        .el-checkbox {
          display: flex;
        }
      }
      .img {
        height: 100%;
        width: 60px;
        background-color: red;
      }
      .text {
        margin-left: 15px;
        .title {
          font-size: 14px;
        }
        .itemNum {
          font-size: 12px;
        }
      }
      .el-checkbox {
        position: absolute;
        display: none;
        right: 6px;
        top: -6px;
      }
    }
  }

  .typeA {
    padding: 9px !important;
    border: 2px solid rgb(0, 120, 212) !important;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.5) !important;

    .el-checkbox {
      display: flex !important;
      right: 5px !important;
      top: -7px !important;
    }
  }
}
</style>

