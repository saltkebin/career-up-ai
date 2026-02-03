// Firebase設定を環境変数から読み込む共通モジュール
// 使用方法: import { db } from './firebase-config.mjs';
//
// 実行前に .env.local の値が必要です。
// dotenvを使うか、環境変数を直接設定してください:
//   node --env-file=.env.local scripts/check-data.mjs

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
  console.error("Error: Firebase設定が見つかりません。");
  console.error("以下のように実行してください:");
  console.error("  node --env-file=.env.local scripts/<script-name>.mjs");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
