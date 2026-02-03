// 実行方法: node --env-file=.env.local scripts/seed-firestore.mjs
import { db } from './firebase-config.mjs';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// パスワード "demo" から生成されるofficeId
function generateOfficeId(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `office_${Math.abs(hash).toString(16)}`;
}

const officeId = generateOfficeId("sharoushi2025");
console.log("Office ID:", officeId);

// テストデータ
const clients = [
  {
    companyName: "株式会社山田製作所",
    registrationNumber: "1301-123456-7",
    isSmallBusiness: true,
    careerUpManager: "山田太郎",
    hasEmploymentRules: true,
    careerUpPlanSubmittedAt: "2024-10-01",
    preparationChecklist: {
      careerUpPlanSubmitted: true,
      employmentRulesReady: true,
      regularEmployeeDefinitionReady: true,
      wageTableReady: true,
      trialPeriodChecked: true,
      socialInsuranceReady: true,
      laborConditionsNotified: true,
      sixMonthEmploymentConfirmed: true,
    }
  },
  {
    companyName: "有限会社鈴木商事",
    registrationNumber: "1302-234567-8",
    isSmallBusiness: true,
    careerUpManager: "鈴木一郎",
    hasEmploymentRules: true,
    careerUpPlanSubmittedAt: "2024-11-15",
    preparationChecklist: {
      careerUpPlanSubmitted: true,
      employmentRulesReady: true,
      regularEmployeeDefinitionReady: false,
      wageTableReady: true,
      trialPeriodChecked: false,
      socialInsuranceReady: true,
      laborConditionsNotified: false,
      sixMonthEmploymentConfirmed: true,
    }
  },
  {
    companyName: "株式会社テクノソリューションズ",
    registrationNumber: "1303-345678-9",
    isSmallBusiness: false,
    careerUpManager: "佐藤花子",
    hasEmploymentRules: true,
    careerUpPlanSubmittedAt: "2024-09-20",
    preparationChecklist: {
      careerUpPlanSubmitted: true,
      employmentRulesReady: true,
      regularEmployeeDefinitionReady: true,
      wageTableReady: true,
      trialPeriodChecked: true,
      socialInsuranceReady: true,
      laborConditionsNotified: true,
      sixMonthEmploymentConfirmed: true,
    }
  }
];

// 日付ヘルパー
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split('T')[0];
}

const today = new Date();
const todayStr = today.toISOString().split('T')[0];

async function seedData() {
  const clientsRef = collection(db, `offices/${officeId}/clients`);
  const applicationsRef = collection(db, `offices/${officeId}/applications`);

  const clientIds = [];

  // クライアント追加
  for (const client of clients) {
    const docRef = await addDoc(clientsRef, {
      ...client,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    clientIds.push(docRef.id);
    console.log(`Added client: ${client.companyName} (${docRef.id})`);
  }

  // 申請データ
  const applications = [
    // 株式会社山田製作所の申請
    {
      clientId: clientIds[0],
      workerName: "田中健太",
      workerNameKana: "タナカ ケンタ",
      birthDate: "1990-05-15",
      gender: "male",
      hireDate: "2024-04-01",
      conversionDate: "2024-10-01",
      conversionType: "fixed_to_regular",
      applicationDeadline: addDays(today, 7), // 7日後
      status: "documents_ready",
      isPriorityTarget: true,
      priorityCategory: "A",
      priorityReason: "雇用保険未加入者",
      preSalary: 250000,
      postSalary: 265000,
      salaryIncreaseRate: 6.0,
      estimatedAmount: { phase1: 1200000, phase2: 1200000, total: 2400000 },
      phase: 1,
      notes: "書類準備完了、来週申請予定"
    },
    {
      clientId: clientIds[0],
      workerName: "佐々木美咲",
      workerNameKana: "ササキ ミサキ",
      birthDate: "1985-11-20",
      gender: "female",
      hireDate: "2024-03-01",
      conversionDate: "2024-09-01",
      conversionType: "fixed_to_regular",
      applicationDeadline: addDays(today, 21), // 21日後
      status: "preparing",
      isPriorityTarget: false,
      priorityCategory: null,
      preSalary: 230000,
      postSalary: 240000,
      salaryIncreaseRate: 4.3,
      estimatedAmount: { phase1: 800000, phase2: 0, total: 800000 },
      phase: 1,
      notes: ""
    },
    // 有限会社鈴木商事の申請
    {
      clientId: clientIds[1],
      workerName: "高橋翔太",
      workerNameKana: "タカハシ ショウタ",
      birthDate: "1995-03-10",
      gender: "male",
      hireDate: "2024-05-15",
      conversionDate: "2024-11-15",
      conversionType: "fixed_to_regular",
      applicationDeadline: addDays(today, 3), // 3日後（緊急）
      status: "preparing",
      isPriorityTarget: true,
      priorityCategory: "C",
      priorityReason: "就職氷河期世代",
      preSalary: 220000,
      postSalary: 230000,
      salaryIncreaseRate: 4.5,
      estimatedAmount: { phase1: 1200000, phase2: 1200000, total: 2400000 },
      phase: 1,
      notes: "期限間近！至急対応"
    },
    {
      clientId: clientIds[1],
      workerName: "伊藤さくら",
      workerNameKana: "イトウ サクラ",
      birthDate: "1988-07-25",
      gender: "female",
      hireDate: "2024-02-01",
      conversionDate: "2024-08-01",
      conversionType: "indefinite_to_regular",
      applicationDeadline: addDays(today, -5), // 5日超過
      status: "submitted",
      isPriorityTarget: false,
      priorityCategory: null,
      preSalary: 200000,
      postSalary: 210000,
      salaryIncreaseRate: 5.0,
      estimatedAmount: { phase1: 800000, phase2: 0, total: 800000 },
      phase: 1,
      notes: "申請済み、審査待ち"
    },
    // 株式会社テクノソリューションズの申請
    {
      clientId: clientIds[2],
      workerName: "渡辺大輝",
      workerNameKana: "ワタナベ ダイキ",
      birthDate: "1992-09-05",
      gender: "male",
      hireDate: "2024-01-15",
      conversionDate: "2024-07-15",
      conversionType: "dispatch_to_regular",
      applicationDeadline: addDays(today, 45), // 45日後
      status: "approved",
      isPriorityTarget: true,
      priorityCategory: "B",
      priorityReason: "5年間に5回以上離職",
      preSalary: 280000,
      postSalary: 300000,
      salaryIncreaseRate: 7.1,
      estimatedAmount: { phase1: 900000, phase2: 900000, total: 1800000 },
      phase: 1,
      notes: "承認済み、第2期準備中"
    },
    {
      clientId: clientIds[2],
      workerName: "中村優子",
      workerNameKana: "ナカムラ ユウコ",
      birthDate: "1980-12-30",
      gender: "female",
      hireDate: "2024-06-01",
      conversionDate: "2024-12-01",
      conversionType: "fixed_to_regular",
      applicationDeadline: addDays(today, 60), // 60日後
      status: "preparing",
      isPriorityTarget: false,
      priorityCategory: null,
      preSalary: 260000,
      postSalary: 275000,
      salaryIncreaseRate: 5.8,
      estimatedAmount: { phase1: 600000, phase2: 0, total: 600000 },
      phase: 1,
      notes: ""
    }
  ];

  // 申請追加
  for (const app of applications) {
    const docRef = await addDoc(applicationsRef, {
      ...app,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log(`Added application: ${app.workerName} (${docRef.id})`);
  }

  console.log("\nSeed data complete!");
  console.log(`- ${clients.length} clients added`);
  console.log(`- ${applications.length} applications added`);
  console.log(`\nLogin with password: demo`);

  process.exit(0);
}

seedData().catch(console.error);
