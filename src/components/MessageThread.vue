<template>
    <div class="container mx-auto p-4 max-w-2xl font-sans">
      <div class="flex items-center gap-3 mb-6">
        <router-link 
          to="/students" 
          class="text-navy hover:text-gold transition-colors flex items-center gap-1"
        >
          <ArrowLeftIcon class="w-5 h-5" />
          Back to Students
        </router-link>
        <h2 class="text-2xl font-serif font-bold text-navy">Messages with {{ studentName }}</h2>
      </div>
  
      <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gold mb-6">
        <div class="space-y-4">
          <div 
            v-for="message in messages" 
            :key="message.id" 
            class="p-4 rounded-xl"
            :class="{
              'bg-gold/10': message.sender === 'student',
              'bg-white border-2 border-navy/10': message.sender === 'tutor'
            }"
          >
            <p class="text-gray-800">{{ message.content }}</p>
            <div class="flex items-center justify-between mt-2">
              <p class="text-sm text-gray-600">
                {{ formatDate(message.timestamp) }}
              </p>
              <span 
                v-if="!message.read && message.sender === 'student'" 
                class="text-red-600 text-sm flex items-center gap-1"
              >
                <ExclamationCircleIcon class="w-4 h-4" />
                Unread
              </span>
            </div>
          </div>
        </div>
      </div>
  
      <div class="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gold">
        <form @submit.prevent="sendMessage" class="space-y-4">
          <textarea 
            v-model="newMessage" 
            class="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all"
            placeholder="Type your reply..."
            rows="3"
          ></textarea>
          <button 
            type="submit" 
            class="bg-navy text-white px-6 py-3 rounded-xl hover:bg-gold hover:text-navy transition-colors duration-200 font-medium flex items-center gap-2"
          >
            <PaperAirplaneIcon class="w-5 h-5" />
            Send Reply
          </button>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { ArrowLeftIcon, PaperAirplaneIcon, ExclamationCircleIcon } from '@heroicons/vue/24/outline';
  import { db } from '../firebase';
  import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
  import { getCurrentUserId } from '../services/auth';
  
  const route = useRoute();
  const studentId = route.params.studentId;
  const messages = ref([]);
  const newMessage = ref('');
  const studentName = ref('');
  
  // Fetch messages in real-time
  onMounted(async () => {
    // Get student name
    const studentDoc = await getDoc(doc(db, 'users', studentId));
    studentName.value = studentDoc.data().name;
  
    // Subscribe to messages
    const q = query(
      collection(db, 'messages'),
      where('tutorId', '==', getCurrentUserId()),
      where('studentId', '==', studentId),
      orderBy('timestamp', 'asc')
    );
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      messages.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()
      }));
  
      // Mark messages as read
      messages.value.forEach(async (msg) => {
        if (msg.sender === 'student' && !msg.read) {
          await updateDoc(doc(db, 'messages', msg.id), { read: true });
        }
      });
    });
  });
  
  const sendMessage = async () => {
    if (!newMessage.value.trim()) return;
  
    await addDoc(collection(db, 'messages'), {
      tutorId: getCurrentUserId(),
      studentId: studentId,
      content: newMessage.value.trim(),
      timestamp: serverTimestamp(),
      read: false,
      sender: 'tutor'
    });
  
    newMessage.value = '';
  };
  
  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  </script>