<template>
  <nav class="bg-white shadow-sm font-sans">
    <div class="mx-auto px-4">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <router-link to="/" class="flex-shrink-0">
          <img src="/Taep-logo.jpeg" alt="TAEP Logo" class="h-17 w-auto">
        </router-link>

        <!-- Desktop Menu -->
        <div class="hidden md:flex items-center space-x-6">
          <ul class="flex space-x-6">
            <li v-for="(item, index) in navItems" :key="index" class="whitespace-nowrap">
              <router-link
                :to="item.path"
                class="text-navy hover:text-gold transition-colors duration-200 px-3 py-2"
                :class="{ 'font-semibold border-b-2 border-navy': $route.path === item.path }"
              >
                {{ item.name }}
              </router-link>
            </li>
          </ul>
          <button 
            v-if="isLoggedIn"
            @click="handleLogout"
            class="ml-4 px-4 py-2 bg-navy text-white rounded-md hover:bg-gold hover:text-navy transition-colors duration-200 flex items-center gap-2"
          >
            <!-- SVG icon remains same -->
            Log Out
          </button>
        </div>

        <!-- Mobile Menu Button -->
        <div class="md:hidden flex items-center">
          <button 
            @click="isMenuOpen = !isMenuOpen"
            class="text-navy hover:text-gold focus:outline-none"
          >
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div 
      class="md:hidden fixed inset-0 z-40 bg-black/50"
      v-show="isMenuOpen"
      @click="closeMenu"
    >
      <div class="absolute top-16 right-0 left-0 bg-white shadow-lg" @click.stop>
        <div class="px-2 pt-2 pb-3 space-y-1">
          <router-link
            v-for="(item, index) in navItems"
            :key="index"
            :to="item.path"
            @click="closeMenu"
            class="text-navy hover:text-gold block px-4 py-2"
            :class="{ 'bg-gold/10 font-semibold': $route.path === item.path }"
          >
            {{ item.name }}
          </router-link>
          <button 
            v-if="isLoggedIn"
            @click="handleLogout"
            class="w-full text-left px-4 py-2 text-navy hover:text-gold hover:bg-gold/10 flex items-center gap-2"
          >
            <!-- SVG icon -->
            Log Out
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'vue-router';
import { onAuthStateChanged } from 'firebase/auth';
import { getCurrentUserRole } from '../services/auth';

const router = useRouter();
const isLoggedIn = ref(false);
const userRole = ref('');
const isMenuOpen = ref(false);

const closeMenu = () => {
  isMenuOpen.value = false;
};

const baseNavItems = [
  { name: 'Announcements', path: '/announcements' },
  { name: 'About', path: '/about' },
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Assessments', path: '/assessments' },
  { name: 'Profile', path: '/profile' },
  { name: 'Resources', path: '/resources' }
];
const navItems = ref([...baseNavItems]); // Initialize with base items
const updateNavigation = async () => {
  try {
    const role = await getCurrentUserRole();
    userRole.value = role;
    
    // Create a fresh array each time
    const newItems = [...baseNavItems];
    
    if (role === 'teacher') {
      newItems.splice(3, 0, { name: 'Students', path: '/students' });
    } else {
      newItems.splice(3, 0, { name: 'Progress', path: '/progress' });
    }
    
    navItems.value = newItems;
  } catch (error) {
    console.error('Error updating navigation:', error);
    navItems.value = [...baseNavItems];
  }
};

onMounted(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    isLoggedIn.value = !!user;
    if (user) {
      updateNavigation();
    } else {
      // Reset navigation when logged out
      navItems.value = [...baseNavItems];
      userRole.value = '';
    }
  });

  return () => unsubscribe();
});

const handleLogout = async () => {
  try {
    await signOut(auth);
    // Force full page reload to clear all states
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout error:', error);
  }
};
</script>

<style scoped>
/* Custom colors based on TAEP logo */
.text-navy {
  color: #1a365d;
}

.border-navy {
  border-color: #1a365d;
}

.bg-navy {
  background-color: #1a365d;
}

.text-gold {
  color: #f8c822;
}

.hover\:bg-gold:hover {
  background-color: #f8c822;
}

.no-scrollbar {
  scrollbar-width: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>