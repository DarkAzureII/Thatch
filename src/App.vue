<template>
  <div class="min-h-screen flex flex-col">
    <Navbar />
    <main class="flex-grow">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" class="pt-4" />
        </transition>
      </router-view>
    </main>
    <footer class="bg-navy text-white py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-4 gap-8">
          <div>
            <img src="/Taep-logo.jpeg" alt="TAEP Logo" class="h-16 w-auto mb-4">
            <p class="text-sm text-gray-300">Empowering academic excellence since 2015</p>
          </div>
          <div>
            <h4 class="font-serif font-semibold mb-4">Quick Links</h4>
            <ul class="space-y-2 text-sm text-gray-300">
              <li><a href="#" class="hover:text-gold transition-colors">About Us</a></li>
              <li><a href="#" class="hover:text-gold transition-colors">Programs</a></li>
              <li><a href="#" class="hover:text-gold transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-serif font-semibold mb-4">Connect</h4>
            <ul class="space-y-2 text-sm text-gray-300">
              <li><a href="#" class="hover:text-gold transition-colors">Facebook</a></li>
              <li><a href="#" class="hover:text-gold transition-colors">LinkedIn</a></li>
              <li><a href="#" class="hover:text-gold transition-colors">Twitter</a></li>
            </ul>
          </div>
          <div>
            <h4 class="font-serif font-semibold mb-4">Contact</h4>
            <ul class="space-y-2 text-sm text-gray-300">
              <li>Cnr Rissik & President St, No.5</li>
              <li>Ekurhuleni College, Mogale Plaza</li>
              <li>076 798 9001</li>
            </ul>
          </div>
        </div>
        <div class="border-t border-gray-700 mt-12 pt-8 text-center text-sm text-gray-300">
          © 2024 The Academic Empowerment Program. All rights reserved.
        </div>
      </div>
    </footer>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Navbar from './components/navbar.vue';

export default defineComponent({
  components: {
    Navbar,
  },
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>