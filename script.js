//fetch
fetch("vocab.json")
  .then(res => res.json())
  .then(json => console.log("本地 vocab:", json));

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// DOM
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userInfo = document.getElementById("userInfo");
const vocabList = document.getElementById("vocabList");

// Google 登入
loginBtn.onclick = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
};

// 登出
logoutBtn.onclick = () => auth.signOut();

// Firebase 監聽登入狀態
auth.onAuthStateChanged(async (user) => {
  if (user) {
    userInfo.innerText = `登入中：${user.displayName}`;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";

    loadUserVocab();
  } else {
    userInfo.innerText = "尚未登入";
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    vocabList.innerHTML = "";
  }
});

// 讀取使用者資料庫
async function loadUserVocab() {
  const uid = auth.currentUser.uid;
  const snapshot = await db.collection("users").doc(uid).collection("vocab").get();

  vocabList.innerHTML = "";

  snapshot.forEach(doc => {
    const li = document.createElement("li");
    li.innerText = `${doc.id}: ${doc.data().meaning}`;
    vocabList.appendChild(li);
  });
}

// 新增（或更新）單字
async function saveWord(word, meaning) {
  const uid = auth.currentUser.uid;
  await db.collection("users").doc(uid).collection("vocab").doc(word).set({
    meaning
  });
}
