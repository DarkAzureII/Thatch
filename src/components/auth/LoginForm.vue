<!-- Login.vue -->
<template>
  <div class="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <img class="mx-auto h-50 w-auto mb-8" src="/Taep-logo.jpeg" alt="TAEP Logo">
      <h2 class="mt-6 text-center text-3xl font-serif font-bold text-gold">
        Sign in to your account
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border-l-4 border-gold">
        <form @submit.prevent="handleLogin" class="space-y-6">
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
              <span v-if="!isLoading">Sign in</span>
              <svg v-else class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </button>
          </div>

          <div class="text-center text-sm">
            <router-link 
              :to="{ name: 'Register' }" 
              class="font-medium text-navy hover:text-gold transition-colors"
            >
              Don't have an account? Register here
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import { signInWithEmailAndPassword } from 'firebase/auth';
  import { auth } from '../../firebase';
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  const email = ref('');
  const password = ref('');
  const isLoading = ref(false);
  const errorMessage = ref('');
  
  const handleLogin = async () => {
    errorMessage.value = '';
    if (!email.value || !password.value) {
      errorMessage.value = 'Please fill in all fields';
      return;
    }
  
    try {
      isLoading.value = true;
      await signInWithEmailAndPassword(auth, email.value, password.value);
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
      case 'auth/invalid-email':
        errorMessage.value = 'Invalid email address';
        break;
      case 'auth/user-not-found':
        errorMessage.value = 'User not found';
        break;
      case 'auth/wrong-password':
        errorMessage.value = 'Incorrect password';
        break;
      default:
        errorMessage.value = 'Login failed. Please try again';
    }
  };
  </script>