<template>
  <div class="container mx-auto p-4 font-sans">
    <div class="mb-6 flex flex-col md:flex-row gap-4 justify-between items-start">
      <h1 class="text-3xl font-serif font-bold text-gold">Student Directory</h1>
      <div class="w-full md:w-64">
        <input 
          v-model="searchQuery"
          type="search"
          placeholder="Search by name or email..."
          class="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all"
        >
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="user in filteredUsers"
        :key="user.id"
        class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-gold"
      >
        <div class="flex items-start gap-4">
          <div class="relative flex-shrink-0">
            <div class="w-12 h-12 rounded-full bg-navy text-gold flex items-center justify-center font-medium">
              {{ user.name.charAt(0).toUpperCase() }}
              <div 
                v-if="user.unread > 0" 
                class="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-sm"
              >
                {{ user.unread }}
              </div>
            </div>
          </div>
          <div class="flex-grow">
            <h3 class="font-serif font-semibold text-lg text-navy">{{ user.name }}</h3>
            <p class="text-gray-600 text-sm mb-1">{{ user.email }}</p>
            <span class="inline-block px-3 py-1 rounded-full text-sm bg-navy text-gold">
              Student
            </span>
            <div v-if="user.coursesEnrolled?.length" class="mt-3">
              <p class="text-sm text-gray-500 mb-1">Courses enrolled:</p>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="course in user.coursesEnrolled"
                  :key="course"
                  class="px-3 py-1 bg-gold/10 text-navy rounded-full text-sm"
                >
                  {{ course }}
                </span>
              </div>
            </div>
            <div class="flex justify-end mt-4 space-x-3">
              <router-link 
                :to="`/messages/${user.id}`"
                class="text-navy hover:text-gold transition-colors flex items-center gap-2 text-sm"
              >
                <ChatBubbleLeftIcon class="w-5 h-5" />
                <span>Messages</span>
              </router-link>
              <router-link 
                :to="`/progress/${user.id}`"
                class="px-4 py-2 bg-navy text-white rounded-xl hover:bg-gold hover:text-navy transition-colors duration-200 text-sm"
              >
                Progress
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredUsers.length === 0" class="text-center py-8 text-gray-500">
      {{ loading ? 'Loading students...' : 'No students found' }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ChatBubbleLeftIcon } from '@heroicons/vue/24/outline';
import { db } from '../firebase'
import { collection, getDocs, query, where, documentId, onSnapshot } from 'firebase/firestore'

const searchQuery = ref('')
const users = ref([])
const loading = ref(true)

// Fetch real student data from Firestore
onMounted(async () => {
  const q = query(collection(db, 'messages'), where('tutorId', '==', 'ZQup1gXnU0S9ebRETyTtWCMebcI2'));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const message = change.doc.data();
        const student = users.value.find(u => u.id === message.studentId);
        if (student && message.sender === 'student' && !message.read) {
          student.unread++;
        }
      }
    });
  });

  // Initial load
  const querySnapshot = await getDocs(q);
  const messages = querySnapshot.docs.map(doc => doc.data());
  
  users.value = users.value.map(user => ({
    ...user,
    unread: messages.filter(m => 
      m.studentId === user.id && 
      m.sender === 'student' && 
      !m.read
    ).length
  }));

  try {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'student')
    )
    
    const querySnapshot = await getDocs(q)
    const students = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      enrolledCourses: doc.data().enrolledCourses || []
    }))

    // Get all unique course IDs from all students
    const allCourseIds = students.flatMap(student => student.enrolledCourses)
    const uniqueCourseIds = [...new Set(allCourseIds)]

    let courseMap = {}
    if (uniqueCourseIds.length > 0) {
      const coursesQuery = query(
        collection(db, 'courses'),
        where(documentId(), 'in', uniqueCourseIds)
      )
      const coursesSnapshot = await getDocs(coursesQuery)
      coursesSnapshot.forEach(doc => {
        courseMap[doc.id] = doc.data().name // Store course name by ID
      })
    }

    // Map course IDs to names for each student
    users.value = students.map(student => ({
      ...student,
      name: student.name || 'Anonymous Student',
      email: student.email || 'No email provided',
      coursesEnrolled: student.enrolledCourses.map(id => courseMap[id] || 'Unknown Course')
    }))

  } catch (error) {
    console.error('Error loading students:', error)
  } finally {
    loading.value = false
  }
})

const filteredUsers = computed(() => {
  if (!users.value) return []
  
  return users.value.filter(user => {
    const search = searchQuery.value.toLowerCase()
    return user.name?.toLowerCase().includes(search) ||
           user.email?.toLowerCase().includes(search)
  })
})
</script>

<style>
.text-navy { color: #2C3E50; }
.bg-teal { background-color: #3498DB; }
</style>