import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { ServiceAccount } from "firebase-admin/app";
import serviceAccount from "../../config.json" with { type: "json" };

const firebaseApp = initializeApp({
  // cert() reads snake_case service-account JSON at runtime; the cast
  // satisfies the camelCase ServiceAccount type expected by the types.
  credential: cert(serviceAccount as unknown as ServiceAccount),
  projectId: serviceAccount.project_id
});

const firebaseDb = getFirestore(firebaseApp);

const firebaseConnection = async () => {
    try {
        await firebaseDb.collection("_connection_test").limit(1).get();
        console.log("FIREBASE CONNECTED SUCCESSFULLY")
    } catch (error) {
        console.log("FIREBASE CONNECTION FAILED", error)
    }
}

export { firebaseConnection, firebaseDb }