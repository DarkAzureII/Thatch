<template>
  <div class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-gold group">
    <div class="flex justify-between items-start gap-4">
      <div class="flex-1">
        <!-- Title -->
        <h3 class="font-serif font-semibold text-navy mb-2">{{ resource.title }}</h3>
        
        <!-- Course Info -->
        <p class="text-sm text-gray-600 mb-3">
          From {{ course?.name || 'Deleted Course' }}
        </p>

        <!-- Resource Content -->
        <div v-if="resource.type === 'file'" class="text-sm">
          <a 
            :href="resource.fileUrl" 
            target="_blank"
            class="text-navy hover:text-gold transition-colors flex items-center gap-2"
          >
            <DocumentIcon class="w-5 h-5 text-gold flex-shrink-0" />
            <span class="truncate">{{ resource.fileName }}</span>
          </a>
          <p class="text-xs text-gray-500 mt-1">
            {{ formatFileSize(resource.size) }} • {{ resource.fileType }}
          </p>
        </div>
        
        <!-- Link Content -->
        <div v-else>
          <a 
            :href="resource.link" 
            target="_blank"
            class="text-navy hover:text-gold transition-colors flex items-center gap-2"
          >
            <LinkIcon class="w-5 h-5 text-gold flex-shrink-0" />
            <span class="truncate">{{ resource.link }}</span>
          </a>
        </div>

        <!-- Upload Date -->
        <p class="text-xs text-gray-500 mt-3">
          Uploaded {{ formatDate(resource.uploadedAt) }}
        </p>
      </div>

      <!-- Delete Button -->
      <button 
        v-if="userRole === 'teacher'"
        @click="$emit('delete', resource.id, resource.fileUrl)"
        class="text-red-600 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
      >
        <TrashIcon class="w-5 h-5" />
        <span class="sr-only">Delete resource</span>
      </button>
    </div>
  </div>
</template>
  
<script setup>
import { defineProps, computed } from 'vue';
import { DocumentIcon, LinkIcon, TrashIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  resource: Object,
  userRole: String,
  courses: {  // Add proper prop definition with default
    type: Array,
    default: () => []  // Provide empty array as default
  }
});

const formatDate = (timestamp) => {
  return new Date(timestamp?.toDate()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
const course = computed(() => 
  props.courses?.find(c => c.id === props.resource.courseId)  // Add optional chaining
);

const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>