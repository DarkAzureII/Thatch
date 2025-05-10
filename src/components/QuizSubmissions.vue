<template>
  <div class="p-4 max-w-4xl mx-auto font-sans">
    <div v-if="loading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
    </div>

    <div v-else>
      <div class="mb-8">
        <h2 class="text-3xl font-serif font-bold text-navy mb-2">{{ quiz?.title }} Submissions</h2>
        <div class="flex items-center gap-4 text-gray-600">
          <span class="bg-navy text-gold px-3 py-1 rounded-full text-sm font-medium">
            {{ quiz?.course }}
          </span>
          <p class="text-sm">
            Average Score: <span class="font-medium">{{ averageScore.toFixed(1) }}</span>/{{ totalMarks }}
          </p>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-lg overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-4 text-left text-sm font-serif font-semibold text-navy uppercase border-b-2 border-gold">
                Student
              </th>
              <th class="px-6 py-4 text-left text-sm font-serif font-semibold text-navy uppercase border-b-2 border-gold">
                Score
              </th>
              <th class="px-6 py-4 text-left text-sm font-serif font-semibold text-navy uppercase border-b-2 border-gold">
                Submitted At
              </th>
              <th class="px-6 py-4 text-left text-sm font-serif font-semibold text-navy uppercase border-b-2 border-gold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr 
              v-for="submission in submissions" 
              :key="submission.id"
              class="hover:bg-gold/5 transition-colors"
            >
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div class="w-8 h-8 bg-navy text-gold rounded-full flex items-center justify-center mr-3">
                    {{ submission.studentName.charAt(0) }}
                  </div>
                  <div>
                    <p class="font-medium text-navy">{{ submission.studentName }}</p>
                    <p class="text-sm text-gray-600">{{ submission.studentEmail }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="bg-gray-100 text-navy px-3 py-1 rounded-full text-sm">
                  {{ submission.score }}/{{ submission.totalMarks }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ formatDate(submission.timestamp) }}
              </td>
              <td class="px-6 py-4">
                <router-link 
                  :to="`/submissions/${submission.id}/mark`"
                  class="text-navy hover:text-gold font-medium flex items-center gap-2 transition-colors"
                >
                  <PencilIcon class="w-5 h-5" />
                  <span>Mark</span>
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="submissions.length === 0" class="p-8 text-center text-gray-500">
          <DocumentTextIcon class="w-12 h-12 mx-auto text-gray-400 mb-2" />
          <p>No submissions yet</p>
        </div>
      </div>
    </div>
  </div>
</template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { db } from '../firebase';
  import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
  import { PencilIcon, DocumentTextIcon } from '@heroicons/vue/24/outline';
  
  const route = useRoute();
  const quizId = route.params.quizId;
  const quiz = ref(null);
  const submissions = ref([]);
  const loading = ref(true);
  const averageScore = ref(0);
  const totalMarks = ref(0); // Add total marks reference

  
  onMounted(async () => {
    try {
      // Get quiz details
      const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
      quiz.value = quizDoc.data();
      totalMarks.value = quiz.value?.totalMarks || 0; // Get total marks from quiz

      // Get submissions for this quiz
      const submissionsQuery = query(
        collection(db, 'submissions'),
        where('quizId', '==', quizId)
      );
      const submissionsSnapshot = await getDocs(submissionsQuery);

      // Get student details and calculate scores
      const submissionsData = await Promise.all(
        submissionsSnapshot.docs.map(async (subDoc) => {
          const submission = subDoc.data();
          const userDoc = await getDoc(doc(db, 'users', submission.studentId));
          const userData = userDoc.data();
          
          return {
            id: subDoc.id,
            ...submission,
            studentName: userData?.name || 'Unknown Student',
            studentEmail: userData?.email || 'No email'
          };
        })
      );

      submissions.value = submissionsData;
      
      // Calculate average score correctly
      if (submissions.value.length > 0) {
        const totalScores = submissions.value.reduce((sum, sub) => sum + sub.score, 0);
        averageScore.value = totalScores / submissions.value.length;
      }
      
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      loading.value = false;
    }
  });

  // Update formatDate to handle timestamps correctly
  const formatDate = (timestamp) => {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  </script>
  
  <style scoped>
  /* Add custom styles if needed */
  </style>