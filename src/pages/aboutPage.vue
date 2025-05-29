<!-- src/views/AboutPage.vue -->
<template>
  <div class="container mx-auto p-4 font-sans">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-serif font-bold text-gold mb-8">About Our Portal</h1>

      <div class="bg-white rounded-lg shadow-lg p-6 mb-8 border-l-4 border-gold">
        <h2 class="text-2xl font-serif font-semibold text-navy mb-4">Our Mission</h2>
        <p class="text-gray-700 leading-relaxed">
          We are committed to providing a seamless digital learning experience that empowers
          students, teachers, and parents to collaborate effectively. Our platform combines
          modern technology with educational best practices to enhance learning outcomes.
        </p>
      </div>

      <div class="grid md:grid-cols-1 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow-lg border-t-4 border-gold">
          <h3 class="text-xl font-serif font-semibold text-navy mb-3">Contact Information</h3>
          <ul class="space-y-2 text-gray-700">
            <li class="flex items-center gap-2">
              <PhoneIcon class="w-5 h-5 text-gold" />
              <span>(021) 555-1234</span>
            </li>
            <li class="flex items-center gap-2">
              <EnvelopeIcon class="w-5 h-5 text-gold" />
              <span>info@schoolportal.ac.za</span>
            </li>
            <li class="flex items-center gap-2">
              <MapPinIcon class="w-5 h-5 text-gold" />
              <span>Cnr Rissik & President St, No.5, Ekurhuleni College, Mogale Plaza</span>
            </li>
          </ul>
        </div>

        <!-- <div class="bg-white p-6 rounded-lg shadow-lg border-t-4 border-navy">
          <h3 class="text-xl font-serif font-semibold text-navy mb-3">Development Team</h3>
          <div class="space-y-3">
            <div v-for="member in team" :key="member.name" class="flex items-center gap-3">
              <div class="w-8 h-8 bg-navy text-gold rounded-full flex items-center justify-center font-medium">
                {{ member.name.charAt(0) }}
              </div>
              <div>
                <p class="font-medium text-gray-800">{{ member.name }}</p>
                <p class="text-sm text-gray-600">{{ member.role }}</p>
              </div>
            </div>
          </div>
        </div> -->
      </div>

      <div class="bg-white p-6 rounded-lg shadow-lg">
        <h3 class="text-xl font-serif font-semibold text-navy mb-4">Platform Features</h3>
        <div class="grid md:grid-cols-2 gap-4">
          <div v-for="feature in features" :key="feature" 
               class="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gold/10 transition-colors">
            <CheckCircleIcon class="w-5 h-5 text-gold flex-shrink-0" />
            <span class="text-gray-700">{{ feature }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
  <script setup>
    import { ref } from 'vue';
    import { CheckCircleIcon, PhoneIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/vue/24/outline';

  const team = ref([
    { name: "Sarah Johnson", role: "Lead Developer" },
    { name: "Michael Brown", role: "UI Designer" },
    { name: "Emma Wilson", role: "Quality Assurance" }
  ])
  
  const features = ref([
    "Secure student portal access",
    "Interactive learning resources",
    "Real-time grade tracking",
    "Mobile-friendly interface",
    "Teacher collaboration tools",
    "Parental monitoring features"
  ])
  </script>
  
  <style>
  .text-navy { color: #2C3E50; }
  .text-teal { color: #3498DB; }
  .text-orange { color: #E67E22; }
  </style>