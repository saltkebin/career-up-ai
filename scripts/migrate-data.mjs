// データを正しいofficeIdに作成するスクリプト
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";

// Using values from .env.local
const firebaseConfig = {
  apiKey: "AIzaSyD-GWveUxVtMjRXNWzQYKW8uhdLF-oyipk",
  authDomain: "career-up-ai-app.firebaseapp.com",
  projectId: "career-up-ai-app",
  storageBucket: "career-up-ai-app.firebasestorage.app",
  messagingSenderId: "562209775630",
  appId: "1:562209775630:web:0e0456155e225eb3ce9c5f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const OLD_OFFICE_ID = "old-demo-office"; // 移行元（存在しない）
const NEW_OFFICE_ID = "demo-office"; // 実際に使用するID

console.log(`移行元: ${OLD_OFFICE_ID}`);
console.log(`移行先: ${NEW_OFFICE_ID}`);
console.log("");

async function migrate() {
  // 移行先に既存データがあるか確認
  const existingClientsRef = collection(db, `offices/${NEW_OFFICE_ID}/clients`);
  const existingClients = await getDocs(existingClientsRef);

  if (existingClients.size > 0) {
    console.log(`移行先に既に ${existingClients.size} 件のクライアントがあります。削除します...`);
    for (const docSnap of existingClients.docs) {
      await deleteDoc(docSnap.ref);
    }
    const existingAppsRef = collection(db, `offices/${NEW_OFFICE_ID}/applications`);
    const existingApps = await getDocs(existingAppsRef);
    for (const docSnap of existingApps.docs) {
      await deleteDoc(docSnap.ref);
    }
    console.log("既存データを削除しました。\n");
  }

  // 移行元データを読み取り
  const oldClientsRef = collection(db, `offices/${OLD_OFFICE_ID}/clients`);
  const oldAppsRef = collection(db, `offices/${OLD_OFFICE_ID}/applications`);

  const oldClients = await getDocs(oldClientsRef);
  const oldApps = await getDocs(oldAppsRef);

  console.log(`移行元クライアント数: ${oldClients.size}`);
  console.log(`移行元申請数: ${oldApps.size}`);

  const now = new Date().toISOString();

  if (oldClients.size === 0) {
    console.log("\n移行元にデータがありません。新規データを作成します...\n");

    // 顧問先データ
    const clients = [
      {
        companyName: "株式会社山田製作所",
        registrationNumber: "1301-123456-7",
        isSmallBusiness: true,
        careerUpManager: "山田太郎",
        hasEmploymentRules: true,
        careerUpPlanSubmittedAt: "2024-10-01",
      },
      {
        companyName: "株式会社テクノソリューションズ",
        registrationNumber: "1302-234567-8",
        isSmallBusiness: true,
        careerUpManager: "鈴木一郎",
        hasEmploymentRules: true,
        careerUpPlanSubmittedAt: "2024-11-15",
      },
      {
        companyName: "有限会社鈴木商事",
        registrationNumber: "1303-345678-9",
        isSmallBusiness: true,
        careerUpManager: "田中花子",
        hasEmploymentRules: false,
        careerUpPlanSubmittedAt: null,
      },
    ];

    const clientIdMap = {};
    const newClientsRef = collection(db, `offices/${NEW_OFFICE_ID}/clients`);

    for (let i = 0; i < clients.length; i++) {
      const client = clients[i];
      const docRef = doc(newClientsRef);
      await setDoc(docRef, {
        ...client,
        createdAt: now,
        updatedAt: now,
      });
      clientIdMap[i] = docRef.id;
      console.log(`✓ 顧問先作成: ${client.companyName} (ID: ${docRef.id})`);
    }

    // 申請データ
    const today = new Date();
    const applications = [
      {
        clientIndex: 0,
        workerName: "田中健太",
        workerNameKana: "タナカ ケンタ",
        birthDate: "1990-05-15",
        gender: "male",
        hireDate: "2023-04-01",
        conversionDate: "2024-10-01",
        conversionType: "fixed_to_regular",
        applicationDeadline: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        status: "preparing",
        isPriorityTarget: true,
        priorityCategory: "A",
        priorityReason: "雇入れ後3年以内の新規雇用者",
        preSalary: 220000,
        postSalary: 250000,
        estimatedAmount: { phase1: 800000, phase2: 400000, total: 1200000 },
        phase: 1,
      },
      {
        clientIndex: 0,
        workerName: "中村優子",
        workerNameKana: "ナカムラ ユウコ",
        birthDate: "1985-08-22",
        gender: "female",
        hireDate: "2022-01-15",
        conversionDate: "2024-09-01",
        conversionType: "fixed_to_regular",
        applicationDeadline: new Date(today.getTime() + 12 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        status: "documents_ready",
        isPriorityTarget: false,
        priorityCategory: null,
        preSalary: 200000,
        postSalary: 210000,
        estimatedAmount: { phase1: 800000, phase2: 0, total: 800000 },
        phase: 1,
      },
      {
        clientIndex: 1,
        workerName: "佐々木美咲",
        workerNameKana: "ササキ ミサキ",
        birthDate: "1992-03-10",
        gender: "female",
        hireDate: "2023-06-01",
        conversionDate: "2024-12-01",
        conversionType: "fixed_to_regular",
        applicationDeadline: new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        status: "preparing",
        isPriorityTarget: true,
        priorityCategory: "B",
        priorityReason: "派遣労働者からの転換",
        preSalary: 230000,
        postSalary: 260000,
        estimatedAmount: { phase1: 800000, phase2: 400000, total: 1200000 },
        phase: 1,
      },
      {
        clientIndex: 1,
        workerName: "渡辺大輝",
        workerNameKana: "ワタナベ ダイキ",
        birthDate: "1988-11-30",
        gender: "male",
        hireDate: "2021-04-01",
        conversionDate: "2024-06-01",
        conversionType: "indefinite_to_regular",
        applicationDeadline: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        status: "submitted",
        isPriorityTarget: false,
        priorityCategory: null,
        preSalary: 250000,
        postSalary: 270000,
        estimatedAmount: { phase1: 400000, phase2: 0, total: 400000 },
        phase: 1,
      },
      {
        clientIndex: 2,
        workerName: "高橋翔太",
        workerNameKana: "タカハシ ショウタ",
        birthDate: "1995-07-08",
        gender: "male",
        hireDate: "2024-01-15",
        conversionDate: "2024-11-01",
        conversionType: "fixed_to_regular",
        applicationDeadline: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        status: "under_review",
        isPriorityTarget: true,
        priorityCategory: "C",
        priorityReason: "正社員求人への応募者",
        preSalary: 210000,
        postSalary: 240000,
        estimatedAmount: { phase1: 800000, phase2: 400000, total: 1200000 },
        phase: 1,
      },
      {
        clientIndex: 2,
        workerName: "伊藤さくら",
        workerNameKana: "イトウ サクラ",
        birthDate: "1993-12-25",
        gender: "female",
        hireDate: "2022-09-01",
        conversionDate: "2024-05-01",
        conversionType: "fixed_to_regular",
        applicationDeadline: "2024-12-25",
        status: "approved",
        isPriorityTarget: false,
        priorityCategory: null,
        preSalary: 195000,
        postSalary: 215000,
        estimatedAmount: { phase1: 800000, phase2: 0, total: 800000 },
        phase: 1,
      },
    ];

    const newAppsRef = collection(db, `offices/${NEW_OFFICE_ID}/applications`);

    for (const app of applications) {
      const { clientIndex, ...appData } = app;
      const docRef = doc(newAppsRef);
      await setDoc(docRef, {
        ...appData,
        clientId: clientIdMap[clientIndex],
        createdAt: now,
        updatedAt: now,
      });
      console.log(`✓ 申請作成: ${app.workerName}`);
    }
  } else {
    // 既存データを移行
    const clientIdMap = {};
    const newClientsRef = collection(db, `offices/${NEW_OFFICE_ID}/clients`);
    const newAppsRef = collection(db, `offices/${NEW_OFFICE_ID}/applications`);

    // クライアントを移行
    for (const docSnap of oldClients.docs) {
      const data = docSnap.data();
      const newDocRef = doc(newClientsRef);
      await setDoc(newDocRef, {
        ...data,
        createdAt: now,
        updatedAt: now,
      });
      clientIdMap[docSnap.id] = newDocRef.id;
      console.log(`✓ 顧問先移行: ${data.companyName}`);
    }

    // 申請を移行
    for (const docSnap of oldApps.docs) {
      const data = docSnap.data();
      const newDocRef = doc(newAppsRef);
      await setDoc(newDocRef, {
        ...data,
        clientId: clientIdMap[data.clientId] || data.clientId,
        createdAt: now,
        updatedAt: now,
      });
      console.log(`✓ 申請移行: ${data.workerName}`);
    }
  }

  console.log("\n✅ 完了!");
  process.exit(0);
}

migrate().catch(err => {
  console.error("エラー:", err);
  process.exit(1);
});
