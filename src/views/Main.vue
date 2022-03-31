<script setup lang="ts">
import { onMounted, reactive, ref } from "@vue/runtime-core";
import { useRouter } from "vue-router";
import { IMainData } from "../types";

let mainData = ref<IMainData[] | []>([]);
onMounted(() => {
  // web页面开发环境下获取不到 chrome，为了防止之后的运行错误，使用 try catch 捕获错误
  try {
    // @ts-ignore
    chrome.storage.sync.get("data", ({ data }) => {
      mainData = data;
    });
  } catch (err) {
    console.log(err);
  }
});

const router: any = useRouter();
const goDetail = () => {
  router.push({
    path:"/details",
    query: {
      id: 123
    }
  });
};

const addNew = () => {};
</script>

<template>
  <div id="main">
    <div class="header">
      <span>集锦</span>
      <br />
      <span @click="goDetail" class="addDetail">+ 启动新集锦</span>
      <button @click="addNew">直接添加新集锦</button>
    </div>
    <div class="main-content">
      <div class="collection" @click="goDetail">
        <div class="img"></div>
        <div class="text">
          <p class="title"><b>新建集锦</b></p>
          <p class="itemNum">个项目</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
#main {
  display: flex;
  flex-direction: column;
  height: 100%;
  .header {
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
  }
  .main-content {
    flex: 1;
    overflow-y: auto;
    .collection {
      display: flex;
      height: 76px;
      padding: 10px;
      margin: 5px 10px 0 10px;
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 5px;
      transition: 0.5s;
      &:hover {
        box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.5);
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
    }
  }
}
</style>

function err(err: any) {
  throw new Error('Function not implemented.');
}

function err(err: any) {
  throw new Error('Function not implemented.');
}
