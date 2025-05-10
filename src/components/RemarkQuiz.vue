<template v-if="submission.status === 'marked'">
    <div class="mt-4 p-3 bg-green-50 rounded">
      <p class="text-sm font-semibold text-green-800">
        This submission has already been marked. Editing will create a new version.
      </p>
      <button 
        @click="confirmRemark"
        class="mt-2 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 text-sm"
      >
        Create New Revision
      </button>
    </div>
  </template>

  <script setup>
  
 const confirmRemark = () => {
  if (confirm('Are you sure you want to create a new marking revision?')) {
    submission.value.status = 'pending';
    isDirty.value = true;
  }
};
  
</script>