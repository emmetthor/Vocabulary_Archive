// 🔹 Firebase Modular API
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  // 其他 config
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const uploadBtn = document.getElementById("uploadBtn");
const userInfo = document.getElementById("userInfo");
const vocabList = document.getElementById("vocabList");

// Google 登入
loginBtn.onclick = async () => {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    if (err.code === "auth/popup-closed-by-user") {
      alert("登入視窗被關閉，請重新登入");
    } else {
      console.error(err);
    }
  }
};

// 登出
logoutBtn.onclick = () => signOut(auth);

// 監聽登入狀態
onAuthStateChanged(auth, (user) => {
  if (user) {
    userInfo.innerText = `登入中：${user.displayName}`;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    loadUserVocab(user.uid);
  } else {
    userInfo.innerText = "尚未登入";
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    vocabList.innerHTML = "";
  }
});

// 上傳 vocab.json
uploadBtn.onclick = async () => {
  const user = auth.currentUser;
  if (!user) {
    alert("請先登入！");
    return;
  }
  const uid = user.uid;

  const vocabUrl = "https://raw.githubusercontent.com/emmetthor/Vocabulary_Archive/main/vocab.json";
  const response = await fetch(vocabUrl);
  const vocabListJSON = await response.json();

  for (const item of vocabListJSON) {
    const word = item.word?.trim();
    if (!word) continue;

    await setDoc(doc(db, "users", uid, "vocab", word), {
      definition: item.definition || "",
      example: item.example || "",
      partsOfSpeech: item["parts-of-speech"] || "",
      testCount: item["test-count"] ?? 0,
      front: item.front || "",
      back: item.back || "",
      main: item.main || "",
      createdAt: Date.now()
    });
  }

  alert("✔ vocab.json 已成功上傳到 Firebase！");
  loadUserVocab(uid); // 上傳後更新列表
};

// 讀取使用者 vocab
async function loadUserVocab(uid) {
  const snapshot = await getDocs(collection(db, "users", uid, "vocab"));
  vocabList.innerHTML = "";
  snapshot.forEach(docSnap => {
    const li = document.createElement("li");
    li.innerText = `${docSnap.id}: ${docSnap.data().definition}`;
    vocabList.appendChild(li);
  });
}