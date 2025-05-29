<!-- src/views/AnnouncementsPage.vue -->
<template>
  <div class="container mx-auto p-4 font-sans">
    <div class="max-w-3xl mx-auto">
      <h1 class="text-3xl font-serif font-bold text-gold mb-8">Announcements</h1>

      <!-- Create Announcement (Teacher only) -->
      <div v-if="userRole === 'teacher'" class="mb-8 bg-white p-6 rounded-lg shadow-lg border-l-4 border-gold">
        <h2 class="text-xl font-serif font-semibold text-navy mb-6">New Announcement</h2>
        <form @submit.prevent="postAnnouncement" class="space-y-4">
          <input 
            v-model="newAnnouncement.title" 
            placeholder="Title" 
            class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all"
          >
          <textarea 
            v-model="newAnnouncement.content" 
            placeholder="Write your announcement..." 
            rows="4"
            class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all"
          ></textarea>
          <button 
            type="submit" 
            class="bg-navy text-white
             px-6 py-3 rounded-lg hover:bg-gold hover:text-navy transition-colors duration-200 font-medium"
          >
            Post Announcement
          </button>
        </form>
      </div>

      <!-- Announcements List -->
      <div v-for="announcement in announcements" :key="announcement.id" 
           class="bg-white mb-6 p-6 rounded-lg shadow-lg">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-10 h-10 bg-navy text-gold rounded-full flex items-center justify-center font-medium shadow-sm">
            {{ announcement.author.charAt(0) }}
          </div>
          <div>
            <h3 class="font-serif font-semibold text-navy text-lg">{{ announcement.title }}</h3>
            <p class="text-sm text-gray-600 mt-1">
              Posted by {{ announcement.author }} · {{ formatDate(announcement.createdAt) }}
            </p>
          </div>
        </div>
        <p class="text-gray-700 mb-6 leading-relaxed">{{ announcement.content }}</p>
        
        <!-- Comments Section -->
        <div class="border-t pt-6">
          <div v-for="comment in announcement.comments" :key="comment.id" 
               class="mb-4 ml-6 pl-4 border-l-2 border-gold">
            <p class="text-gray-700 text-sm">{{ comment.text }}</p>
            <p class="text-xs text-gray-600 mt-2">
              – {{ comment.author }}, {{ formatDate(comment.createdAt) }}
            </p>
          </div>

          <!-- Add Comment -->
          <form @submit.prevent="addComment(announcement)" class="mt-6 flex flex-col md:flex-row gap-4">
            <input 
              v-model="newComment" 
              placeholder="Add a comment..." 
              class="flex-grow p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all"
            >
            <button 
              type="submit" 
              class="bg-navy text-white px-6 py-3 rounded-lg hover:bg-gold hover:text-navy transition-colors duration-200 font-medium md:w-auto w-full"
            >
              Comment
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue'
  import { db, auth } from '../firebase'
  import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore'
  import { getCurrentUserRole, getCurrentUserData } from '../services/auth'
  
  // Refs
  const announcements = ref([])
  const userRole = ref('student')
  const newAnnouncement = ref({ title: '', content: '' })
  const newComment = ref('')
  let unsubscribeAnnouncements = null
  const unsubscribeComments = ref({})
  
  // Get current user data
  const currentUser = ref(null)
  
  // Firestore references
  const announcementsCol = collection(db, 'announcements')
  
  onMounted(async () => {
    currentUser.value = await getCurrentUserData()
    userRole.value = currentUser.value?.role || 'student'
    
    // Real-time announcements listener
    unsubscribeAnnouncements = onSnapshot(
      query(announcementsCol, orderBy('createdAt', 'desc')),
      async (snapshot) => {
        const anns = []
        snapshot.docs.forEach(doc => {
          const data = doc.data()
          anns.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
            comments: []
          })
        })
        announcements.value = anns
        
        // Setup comments listeners for each announcement
        announcements.value.forEach(ann => {
          setupCommentsListener(ann.id)
        })
      }
    )
  })
  
  onUnmounted(() => {
    if (unsubscribeAnnouncements) unsubscribeAnnouncements()
    Object.values(unsubscribeComments.value).forEach(unsub => unsub())
  })
  
  // Setup real-time comments listener for an announcement
  const setupCommentsListener = (announcementId) => {
    if (unsubscribeComments.value[announcementId]) return
    
    const commentsCol = collection(db, `announcements/${announcementId}/comments`)
    unsubscribeComments.value[announcementId] = onSnapshot(
      query(commentsCol, orderBy('createdAt')),
      (snapshot) => {
        const announcement = announcements.value.find(a => a.id === announcementId)
        if (!announcement) return
        
        announcement.comments = snapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate()
          }
        })
      }
    )
  }
  
  // Post new announcement
  const postAnnouncement = async () => {
    if (!newAnnouncement.value.title.trim()) return
    
    try {
      await addDoc(announcementsCol, {
        title: newAnnouncement.value.title,
        content: newAnnouncement.value.content,
        author: currentUser.value.name,
        authorId: auth.currentUser.uid,
        createdAt: new Date(),
        courseId: 'general' // Add course-specific logic if needed
      })
      newAnnouncement.value = { title: '', content: '' }
    } catch (error) {
      console.error('Error posting announcement:', error)
    }
  }
  
  // Add comment to announcement
  const addComment = async (announcement) => {
  if (!newComment.value.trim()) return
  
  try {
    // Refresh user data before posting comment
    const userData = await getCurrentUserData(true);
    
    await addDoc(collection(db, `announcements/${announcement.id}/comments`), {
      text: newComment.value,
      author: userData?.name || 'Anonymous Student',
      authorId: auth.currentUser.uid,
      createdAt: new Date()
    });
    newComment.value = '';
  } catch (error) {
    console.error('Error adding comment:', error);
  }
}
  // Date formatting helpers
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  </script>
  
  <style>
  .text-navy { color: #2C3E50; }
  .bg-teal { background-color: #3498DB; }
  .hover\:bg-teal-dark:hover { background-color: #2980B9; }
  .bg-orange { background-color: #E67E22; }
  </style>