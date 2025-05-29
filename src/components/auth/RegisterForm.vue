<!-- Register.vue -->
<template>
  <div class="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <img class="mx-auto h-16 w-auto mb-8" src="/Taep-logo.jpeg" alt="TAEP Logo">
      <h2 class="mt-6 text-center text-3xl font-serif font-bold text-gold">
        Create a new account
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border-l-4 border-gold">
        <form @submit.prevent="handleRegister" class="space-y-6">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <div class="mt-1">
              <input
                id="name"
                v-model="name"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold sm:text-sm transition-all"
              >
            </div>
          </div>

          <div>
            <label for="grade" class="block text-sm font-medium text-gray-700">
              Grade
            </label>
            <div class="mt-1">
              <select
                id="grade"
                v-model="grade"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold sm:text-sm transition-all"
              >
                <option value="" disabled>Select Grade</option>
                <option v-for="grade in 12" :value="grade">Grade {{ grade }}</option>
              </select>
            </div>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div class="mt-1">
              <input
                id="email"
                v-model="email"
                type="email"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold sm:text-sm transition-all"
                :class="{ 'border-red-500': emailError }"
              >
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div class="mt-1">
              <input
                id="password"
                v-model="password"
                type="password"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold sm:text-sm transition-all"
                :class="{ 'border-red-500': passwordError }"
              >
            </div>
          </div>

          <div v-if="errorMessage" class="text-red-600 text-sm">
            {{ errorMessage }}
          </div>

          <div>
            <button
              type="submit"
              class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-navy hover:bg-gold hover:text-navy transition-colors duration-200"
              :disabled="isLoading"
            >
              <span v-if="!isLoading">Create Account</span>
              <svg v-else class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </button>
          </div>

          <div class="text-center text-sm">
            <router-link 
              :to="{ name: 'Login' }" 
              class="font-medium text-navy hover:text-gold transition-colors"
            >
              Already have an account? Sign in
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'vue-router';

const router = useRouter();
const name = ref('');
const grade = ref('');
const email = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

const handleRegister = async () => {
  errorMessage.value = '';
  if (!name.value || !grade.value || !email.value || !password.value) {
    errorMessage.value = 'Please fill in all fields';
    return;
  }

  try {
    isLoading.value = true;
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );

    await setDoc(doc(db, 'users', userCredential.user.uid), {
      name: name.value,
      grade: grade.value,
      email: email.value,
      role: 'student', // 🔒 Force role to student
      createdAt: new Date(),
      coursesEnrolled: []
    });

    router.push('/dashboard');
  } catch (error) {
    handleAuthError(error);
  } finally {
    isLoading.value = false;
  }
};

const emailError = computed(() => {
  return errorMessage.value.toLowerCase().includes('email');
});

const passwordError = computed(() => {
  return errorMessage.value.toLowerCase().includes('password');
});

const handleAuthError = (error) => {
  switch (error.code) {
    case 'auth/email-already-in-use':
      errorMessage.value = 'Email already in use';
      break;
    case 'auth/weak-password':
      errorMessage.value = 'Password should be at least 6 characters';
      break;
    case 'auth/invalid-email':
      errorMessage.value = 'Invalid email address';
      break;
    default:
      errorMessage.value = 'Registration failed. Please try again';
  }
};
</script>
