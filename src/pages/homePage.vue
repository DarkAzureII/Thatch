<template>
  <div class="min-h-screen bg-svg-pattern font-sans">

    <!-- Hero Section -->
    <div class="bg-gradient-to-b from-navy/5 to-yellow-300">
      <div class="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl font-serif font-bold text-white md:text-6xl mb-6">
            Empowering Tomorrow's Leaders Through Education
          </h1>
          <p class="mt-4 text-xl text-white max-w-3xl mx-auto">
            Transformative learning experiences that combine academic excellence with personal growth
          </p>
          <div class="mt-8">
            <router-link 
              to="/register" 
              class="bg-gradient-to-r from-gold to-amber-500 text-navy px-8 py-4 rounded-lg text-lg font-medium hover:from-navy hover:to-blue-900 hover:text-gold transition-all duration-300 shadow-md hover:shadow-lg"        
            >
              Start Your Journey
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Transition Section -->
    <!-- <div class="h-24 bg-gradient-to-b from-yellow-300 to-white"></div> -->


    <!-- Features Grid -->
    <div class="bg-gradient-to-b from-yellow-300 to-navy py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-3 gap-12">
          <div class="p-6 border-l-4 border-gold bg-white rounded-lg shadow-lg">
            <AcademicCapIcon class="h-12 w-12 text-gold mb-4" />
            <h3 class="text-xl font-serif font-semibold text-navy mb-2">Personalized Learning</h3>
            <p class="text-gray-600">Adaptive curriculum tailored to individual learning styles and academic goals</p>
          </div>
          
          <div class="p-6 border-l-4 border-gold bg-white rounded-lg shadow-lg">
            <LightBulbIcon class="h-12 w-12 text-gold mb-4" />
            <h3 class="text-xl font-serif font-semibold text-navy mb-2">Innovative Methods</h3>
            <p class="text-gray-600">Cutting-edge teaching approaches combining technology and proven pedagogy</p>
          </div>
          
          <div class="p-6 border-l-4 border-gold bg-white rounded-lg shadow-lg">
            <UserGroupIcon class="h-12 w-12 text-gold mb-4" />
            <h3 class="text-xl font-serif font-semibold text-navy mb-2">Mentorship Program</h3>
            <p class="text-gray-600">1:1 guidance from experienced educators and industry professionals</p>
          </div>
        </div>
      </div>
    </div>

    <!-- <div class="h-24 bg-gradient-to-b from-white to-navy"></div> -->

    <!-- Program Highlights -->
    <div class=" text-gold py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="lg:text-center">
          <h2 class="text-3xl font-serif font-bold mb-12">Our Pillars of Success</h2>
          <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div class="p-6 text-center">
              <div class="bg-gold/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span class="text-3xl font-bold text-gold">98%</span>
              </div>
              <p class="font-medium">University Acceptance Rate</p>
            </div>
            <div class="p-6 text-center">
              <div class="bg-gold/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span class="text-3xl font-bold text-gold">25+</span>
              </div>
              <p class="font-medium">Academic Programs</p>
            </div>
            <div class="p-6 text-center">
              <div class="bg-gold/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span class="text-3xl font-bold text-gold">100%</span>
              </div>
              <p class="font-medium">Personalized Support</p>
            </div>
            <div class="p-6 text-center">
              <div class="bg-gold/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span class="text-3xl font-bold text-gold">1:5</span>
              </div>
              <p class="font-medium">Student-Teacher Ratio</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Testimonials -->
    <div class="bg-gradient-to-b from-navy/5 to-white py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-serif font-bold text-navy text-center mb-12">Success Stories</h2>
        <div class="grid md:grid-cols-2 gap-8">
          <div class="p-8 bg-gray-50 rounded-xl border-l-4 border-gold">
            <p class="text-gray-600 mb-4">"TAEP transformed how I approach learning. The personalized mentorship helped me discover my true potential."</p>
            <div class="flex items-center">
              <div class="bg-navy text-gold rounded-full w-12 h-12 flex items-center justify-center mr-4">AS</div>
              <div>
                <p class="font-medium text-navy">Aisha S.</p>
                <p class="text-sm text-gray-500">Grade 12 Student</p>
              </div>
            </div>
          </div>
          <div class="p-8 bg-gray-50 rounded-xl border-l-4 border-gold">
            <p class="text-gray-600 mb-4">"Teaching with TAEP's innovative platform has revolutionized my ability to support diverse learners."</p>
            <div class="flex items-center">
              <div class="bg-navy text-gold rounded-full w-12 h-12 flex items-center justify-center mr-4">MR</div>
              <div>
                <p class="font-medium text-navy">Mr. Roberts</p>
                <p class="text-sm text-gray-500">Mathematics Mentor</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { AcademicCapIcon, LightBulbIcon, UserGroupIcon } from '@heroicons/vue/24/outline';
</script>