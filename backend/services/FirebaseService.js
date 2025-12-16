// Firebase Configuration and Service
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAM01pavGwIRN4NjlRF941ikGu6R4c8Tuk",
  authDomain: "agentic-loan.firebaseapp.com",
  projectId: "agentic-loan",
  storageBucket: "agentic-loan.firebasestorage.app",
  messagingSenderId: "15856653012",
  appId: "1:15856653012:web:238a1180d70e1f685f6141"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

class FirebaseService {
  // Get customer by phone number
  static async getCustomerByPhone(phone) {
    try {
      const docRef = doc(db, 'customers', phone)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return { ...docSnap.data(), phone }
      }
      return null
    } catch (error) {
      console.error('Firebase error:', error)
      return null
    }
  }
  
  // Get customer by customerId
  static async getCustomerById(customerId) {
    try {
      const customersRef = collection(db, 'customers')
      const snapshot = await getDocs(customersRef)
      
      for (const doc of snapshot.docs) {
        const data = doc.data()
        if (data.customerId === customerId) {
          return { ...data, phone: doc.id }
        }
      }
      return null
    } catch (error) {
      console.error('Firebase error:', error)
      return null
    }
  }
  
  // Add new customer
  static async addCustomer(phone, customerData) {
    try {
      await setDoc(doc(db, 'customers', phone), customerData)
      return true
    } catch (error) {
      console.error('Firebase error:', error)
      return false
    }
  }
  
  // Initialize dummy customers (call once)
  static async initializeDummyCustomers() {
    const dummyCustomers = [
      {
        phone: '+919876543210',
        data: {
          customerId: 'CUST001',
          name: 'Rajesh Kumar',
          creditScore: 780,
          preApprovedLimit: 300000,
          kycStatus: 'VERIFIED',
          employmentType: 'SALARIED',
          monthlyIncome: 75000,
          existingLoans: []
        }
      },
      {
        phone: '+919876543211',
        data: {
          customerId: 'CUST002',
          name: 'Priya Sharma',
          creditScore: 650,
          preApprovedLimit: 150000,
          kycStatus: 'VERIFIED',
          employmentType: 'SALARIED',
          monthlyIncome: 50000,
          existingLoans: []
        }
      },
      {
        phone: '+919876543212',
        data: {
          customerId: 'CUST003',
          name: 'Amit Patel',
          creditScore: 820,
          preApprovedLimit: 500000,
          kycStatus: 'VERIFIED',
          employmentType: 'SALARIED',
          monthlyIncome: 120000,
          existingLoans: []
        }
      },
      {
        phone: '+919876543213',
        data: {
          customerId: 'CUST004',
          name: 'Sneha Reddy',
          creditScore: 750,
          preApprovedLimit: 400000,
          kycStatus: 'VERIFIED',
          employmentType: 'SALARIED',
          monthlyIncome: 95000,
          existingLoans: []
        }
      },
      {
        phone: '+919876543214',
        data: {
          customerId: 'CUST005',
          name: 'Vikram Singh',
          creditScore: 690,
          preApprovedLimit: 200000,
          kycStatus: 'VERIFIED',
          employmentType: 'SALARIED',
          monthlyIncome: 60000,
          existingLoans: []
        }
      },
      {
        phone: '+919876543215',
        data: {
          customerId: 'CUST006',
          name: 'Ananya Iyer',
          creditScore: 800,
          preApprovedLimit: 450000,
          kycStatus: 'VERIFIED',
          employmentType: 'SALARIED',
          monthlyIncome: 110000,
          existingLoans: []
        }
      },
      {
        phone: '+919876543216',
        data: {
          customerId: 'CUST007',
          name: 'Rahul Mehta',
          creditScore: 720,
          preApprovedLimit: 350000,
          kycStatus: 'VERIFIED',
          employmentType: 'SALARIED',
          monthlyIncome: 85000,
          existingLoans: []
        }
      },
      {
        phone: '+919876543217',
        data: {
          customerId: 'CUST008',
          name: 'Kavita Desai',
          creditScore: 670,
          preApprovedLimit: 180000,
          kycStatus: 'VERIFIED',
          employmentType: 'SALARIED',
          monthlyIncome: 55000,
          existingLoans: []
        }
      },
      {
        phone: '+919876543218',
        data: {
          customerId: 'CUST009',
          name: 'Arjun Nair',
          creditScore: 790,
          preApprovedLimit: 420000,
          kycStatus: 'VERIFIED',
          employmentType: 'SALARIED',
          monthlyIncome: 105000,
          existingLoans: []
        }
      },
      {
        phone: '+919876543219',
        data: {
          customerId: 'CUST010',
          name: 'Meera Kapoor',
          creditScore: 740,
          preApprovedLimit: 380000,
          kycStatus: 'VERIFIED',
          employmentType: 'SALARIED',
          monthlyIncome: 92000,
          existingLoans: []
        }
      }
    ]
    
    for (const customer of dummyCustomers) {
      await this.addCustomer(customer.phone, customer.data)
    }
    
    console.log('✓ 10 dummy customers initialized in Firebase')
  }
}

export default FirebaseService
