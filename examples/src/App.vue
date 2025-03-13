<template>
  <div class="main">
    <div class="item-group">
      <div class="title">
        当前使用的开放平台信息: <br />
        appID： {{ appID }} <br />
        appKey： {{ appKey }} <br /><br />
        ------------------- 基础功能 -------------------
      </div>
      <div class="content" style="display: block;">
        <div class="item">
          <button :onclick="onAuth">第一步：用户授权</button>
          <div class="content">
            authcode: {{ authcode }}
          </div>
        </div>
        <div class="item">
          <button :onclick="onAccessToken" style="height: 50px;">第二步：获取用户access_token<br />(仅演示，此步骤应该在服务端调用)</button>
          <div class="content">
            access_token: {{ accessToken?.access_token }} <br />
            expire: {{ accessToken?.expire || 0 }} 秒
          </div>
        </div>
        <div class="item">
          <button :onclick="onGetUserInfo" style="height: 50px;">第三步：获取用户信息<br />(仅演示，此步骤应该在服务端调用)</button>
          <div class="content" style="font-size: 12px;display: block;margin-left: 100px;">
            uid: {{ userinfo?.uid || "" }}<br />
            名字: {{ userinfo?.name || "" }}<br />
            <div>
              头像: <img :src="userinfo?.avatar" style="width: 32px;height: 32px;" />
            </div>
          </div>
        </div>
      </div>x
    </div>
    <div class="item-group">
      <div class="title">
        ------------------- 会话 -------------------
      </div>
      <div class="content">
        <div class="item">
          <button :onclick="onChooseConversation">选择会话</button>
        </div>
        <div class="item">
          <button>当前会话</button>
        </div>
        <div class="item">
          <button>打开会话</button>
        </div>
      </div>

    </div>

    <div class="item-group">
      <div class="title">
        ------------------- 消息 -------------------
      </div>
      <div class="content">
        <div class="item">
          <button>发消息</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

import { ref } from 'vue';
import { tsdd } from 'tsddjsbridge'
import axios from 'axios'

const authcode = ref("")

const accessToken = ref(null)

const userinfo = ref()

const appID = ref("test")
const appKey = ref("test")

tsdd.config = {
  appID: appID.value
}

tsdd.ready((err) => {
  if (err) {
    console.log("初始化失败", err)
    alert("初始化失败，请在唐僧叨叨APP内打开")
    return
  }
})

const onAuth = async () => {
  const authResp = await tsdd.auth()
  authcode.value = authResp.code
}

const onChooseConversation = async () => {
  const conversation = await tsdd.chooseConversation()
  console.log("conversation--->", conversation)
}

const onAccessToken = async () => {
  if (authcode.value === "") {
    alert("请先授权")
    return
  }
  axios.get(`https://api.botgate.cn/v1/openapi/access_token?authcode=${authcode.value}&app_key=${appKey.value}`).then((res) => {
    accessToken.value = res.data
  }).catch((err) => {
    alert(JSON.stringify(err))
    alert("获取access_token失败", err)
  })
}

const onGetUserInfo = async () => {
  if (!accessToken.value) {
    alert("请先获取access_token")
    return
  }
  axios.get(`https://api.botgate.cn/v1/openapi/userinfo?access_token=${accessToken.value.access_token}`).then((res) => {
    userinfo.value = res.data
  }).catch((err) => {
    alert(JSON.stringify(err.response.data))
    alert("获取用户信息失败", err)
  })
}



</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.item-group .content {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}

.item-group .title {
  margin-bottom: 20px;
  font-size: 14px;
  color: gray;
}

.main .item {
  margin-bottom: 60px;
}

.main .item button {
  min-width: 100px;
  height: 40px;
}

.main .item .content {
  margin-top: 10px;
  font-size: 12px;
  text-align: left;
}
</style>
