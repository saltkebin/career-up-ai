import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

const officeId = "demo-office";

async function checkData() {
  const clientsRef = collection(db, `offices/${officeId}/clients`);
  const clientsSnap = await getDocs(clientsRef);
  console.log(`Clients: ${clientsSnap.size}件`);
  clientsSnap.forEach(doc => {
    const data = doc.data();
    console.log(`  - ${data.companyName}`);
  });

  const appsRef = collection(db, `offices/${officeId}/applications`);
  const appsSnap = await getDocs(appsRef);
  console.log(`Applications: ${appsSnap.size}件`);
  appsSnap.forEach(doc => {
    const data = doc.data();
    console.log(`  - ${data.workerName}`);
  });

  process.exit(0);
}

checkData().catch(console.error);
