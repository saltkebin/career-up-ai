import { db } from './firebase-config.mjs';
import { collection, getDocs } from 'firebase/firestore';

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
