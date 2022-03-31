<script setup lang="ts">
import { onMounted, reactive } from "@vue/runtime-core";
import { ArrowLeftBold } from "@element-plus/icons-vue";
import { useRouter, useRoute } from "vue-router";
const router: any = useRouter();
const route: any = useRoute();
onMounted(() => {
  // 获取路由query参数 用于判断是哪个集锦
  console.log(route.query.id);
});

const goMain = () => {
  router.push("/main");
};

let tabInfo = reactive<{ url: string; title: string }>({
  url: "",
  title: "",
});

const getTabData = async () => {
  // 获取tab页面的数据
  try {
    // @ts-ignore
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    [tabInfo.url, tabInfo.title] = [tab.url, tab.title];
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
        <div class="collection-name"></div>
      </div>
      <span @click="getTabData" class="addDetail">+ 添加当前页面</span>
    </header>

    <button @click="getTabData">获取当前tab页面的数据</button>
    <div>{{ tabInfo.title }}</div>
    <div>{{ tabInfo.url }}</div>
  </div>
</template>

<style scoped lang="less">
</style>
