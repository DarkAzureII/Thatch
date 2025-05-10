<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl w-full max-w-2xl flex flex-col max-h-[90vh] shadow-2xl">
      <form @submit.prevent="submitQuiz" class="flex flex-col flex-1 min-h-0">
        <div class="p-6 overflow-y-auto flex-1 min-h-0">
          <h3 class="text-2xl font-serif font-bold text-navy mb-6 sticky top-0 bg-white py-2 border-b border-gold/20">
            Create New Quiz
          </h3>

          <!-- Quiz Metadata -->
          <div class="space-y-6 mb-8">
            <div>
              <label class="block mb-3 font-medium text-navy">Quiz Title</label>
              <input 
                v-model="quiz.title" 
                required 
                class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all"
              >
            </div>
            
            <div>
              <label class="block mb-3 font-medium text-navy">Course</label>
              <select 
                v-model="quiz.courseId" 
                required 
                class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all"
              >
                <option disabled value="" class="text-gray-400">Select a course</option>
                <option 
                  v-for="course in teacherCourses" 
                  :key="course.id" 
                  :value="course.id"
                  class="text-navy"
                >
                  {{ course.name }} (Grade {{ course.grade }} {{ course.subject }})
                </option>
              </select>
            </div>

            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <label class="block mb-3 font-medium text-navy">Deadline</label>
                <input 
                  v-model="quiz.deadline" 
                  type="datetime-local" 
                  required 
                  class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all"
                >
              </div>

              <div>
                <label class="block mb-3 font-medium text-navy">Time Limit (minutes)</label>
                <input 
                  v-model.number="quiz.timeLimit"
                  type="number"
                  min="1"
                  required
                  class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all"
                >
              </div>

              <div>
                <label class="block mb-3 font-medium text-navy">Max Attempts</label>
                <input 
                  v-model.number="quiz.maxAttempts"
                  type="number"
                  min="1"
                  :max="10"
                  class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all"
                  :value="quiz.maxAttempts || 2"
                >
              </div>
            </div>
          </div>

          <!-- Questions Container -->
          <div v-for="(question, qIndex) in quiz.questions" :key="qIndex" 
               class="mb-8 border border-gold/20 rounded-xl p-6 bg-gray-50/50">
            <div class="flex justify-between items-center mb-6">
              <h4 class="font-serif font-medium text-navy">Question {{ qIndex + 1 }}</h4>
              <button 
                @click="removeQuestion(qIndex)"
                type="button" 
                class="text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <TrashIcon class="w-5 h-5" />
                <span>Remove</span>
              </button>
            </div>

            <!-- Marks Allocation -->
            <div class="mb-6">
              <label class="block mb-3 font-medium text-navy">Marks</label>
              <input 
                v-model.number="question.marks"
                type="number"
                min="1"
                required
                class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all"
              >
            </div>

            <!-- Image Upload -->
            <div class="mb-6">
              <label class="block mb-3 font-medium text-navy">Question Image (Optional)</label>
              <div class="relative group">
                <input
                  type="file"
                  @change="handleImageUpload(qIndex, $event)"
                  accept="image/*"
                  class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-navy file:text-gold hover:file:bg-gold/20"
                >
                <img v-if="question.imagePreview" :src="question.imagePreview" 
                     class="mt-4 max-h-32 object-contain border border-gray-200 rounded-lg">
              </div>
            </div>

            <!-- Question Type Selector -->
            <div class="mb-6">
              <label class="block mb-3 font-medium text-navy">Question Type</label>
              <select 
                v-model="question.type" 
                class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all"
              >
                <option value="text" class="text-navy">Text Answer</option>
                <option value="multiple_choice" class="text-navy">Multiple Choice</option>
                <option value="multi_select" class="text-navy">Multi-Select</option>
              </select>
            </div>

            <!-- Question Text -->
            <div class="mb-6">
              <label class="block mb-3 font-medium text-navy">Question Text</label>
              <textarea
                v-model="question.text"
                placeholder="Enter question text..."
                class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all min-h-[100px]"
              ></textarea>
            </div>

            <!-- Options for Multiple Choice/Multi-Select -->
            <div v-if="['multiple_choice', 'multi_select'].includes(question.type)" class="space-y-3">
              <div 
                v-for="(option, oIndex) in question.options" 
                :key="oIndex"
                class="flex items-center gap-3"
              >
                <input
                  v-model="option.text"
                  type="text"
                  placeholder="Option text"
                  class="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all"
                >
                <button
                  @click="removeOption(qIndex, oIndex)"
                  type="button"
                  class="text-red-600 hover:text-red-700 p-2 rounded-full hover:bg-red-50"
                >
                  <XMarkIcon class="w-5 h-5" />
                </button>
              </div>
              <button
                @click="addOption(qIndex)"
                type="button"
                class="text-navy hover:text-gold flex items-center gap-2 transition-colors"
              >
                <PlusIcon class="w-5 h-5" />
                Add Option
              </button>
            </div>

            <!-- Correct Answers -->
            <div class="mt-6">
              <label class="block mb-3 font-medium text-navy">Correct Answer(s)</label>
              
              <!-- Text Answer -->
              <input
                v-if="question.type === 'text'"
                v-model="question.correctAnswer"
                type="text"
                required
                class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all"
              >

              <!-- Multiple Choice -->
              <select
                v-if="question.type === 'multiple_choice'"
                v-model="question.correctAnswer"
                required
                class="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all"
              >
                <option 
                  v-for="(option, oIndex) in question.options" 
                  :key="oIndex" 
                  :value="option.text"
                  class="text-navy"
                >
                  {{ option.text }}
                </option>
              </select>

              <!-- Multi-Select -->
              <div v-if="question.type === 'multi_select'" class="space-y-3">
                <label 
                  v-for="(option, oIndex) in question.options" 
                  :key="oIndex"
                  class="flex items-center gap-3 p-3 hover:bg-gold/5 rounded-lg transition-colors"
                >
                  <input
                    type="checkbox"
                    :value="option.text"
                    v-model="question.correctAnswers"
                    class="h-5 w-5 text-gold border-gray-300 rounded focus:ring-gold"
                  >
                  <span class="text-gray-700">{{ option.text }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Sticky Footer -->
        <div class="border-t border-gold/20 p-6 bg-white sticky bottom-0">
          <div class="flex flex-col md:flex-row justify-between items-center gap-4">
            <button 
              @click="addQuestion"
              type="button" 
              class="bg-navy text-gold px-6 py-3 rounded-lg hover:bg-gold hover:text-navy transition-colors duration-200 font-medium flex items-center gap-2 w-full md:w-auto"
            >
              <PlusIcon class="w-5 h-5" />
              Add Question
            </button>
            
            <div class="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <button 
                @click="$emit('close')"
                type="button" 
                class="px-6 py-3 text-gray-600 hover:text-navy transition-colors font-medium border border-gray-200 rounded-lg w-full md:w-auto"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                class="bg-navy text-white px-6 py-3 rounded-lg hover:bg-gold hover:text-navy transition-colors duration-200 font-medium flex items-center justify-center gap-2 w-full md:w-auto"
              >
                <CheckIcon class="w-5 h-5" />
                Publish Quiz
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { auth, db, storage } from '../firebase';
  import { collection, addDoc, doc, query, where, getDocs } from 'firebase/firestore';
  import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
  import { TrashIcon, XMarkIcon, PlusIcon, CheckIcon } from '@heroicons/vue/24/outline';

  
  const emit = defineEmits(['close', 'created']);
  const teacherCourses = ref([]);
  
  const quiz = ref({
    title: '',
    courseId: '',
    deadline: '',
    questions: []
  });

  onMounted(async () => {
  const user = auth.currentUser;
  if (user) {
    // Create reference to current user's document
    const teacherRef = doc(db, 'users', user.uid);
    // Query courses where teacherId matches current user
    const q = query(collection(db, 'courses'), where('teacherId', '==', teacherRef));
    const snapshot = await getDocs(q);
    
    teacherCourses.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
});
  
function addQuestion() {
  quiz.value.questions.push({
    type: 'text',
    text: '',
    marks: 1,
    imageFile: null,
    imagePreview: null,
    imageUrl: null,
    options: [],
    correctAnswer: '',
    correctAnswers: []
  });
}

async function handleImageUpload(qIndex, event) {
  const file = event.target.files[0];
  if (!file) return;

  const question = quiz.value.questions[qIndex];
  question.imageFile = file;
  
  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    question.imagePreview = e.target.result;
  };
  reader.readAsDataURL(file);
}
  
  function removeQuestion(index) {
    quiz.value.questions.splice(index, 1);
  }
  
  function addOption(qIndex) {
    quiz.value.questions[qIndex].options.push({ text: '' });
  }
  
  function removeOption(qIndex, oIndex) {
    quiz.value.questions[qIndex].options.splice(oIndex, 1);
  }
  
  async function submitQuiz() {
  try {
    // Upload images first
    for (const question of quiz.value.questions) {
      if (question.imageFile) {
        const filePath = `quizzes/${auth.currentUser.uid}/${Date.now()}_${question.imageFile.name}`;
        const fileRef = storageRef(storage, filePath);
        await uploadBytes(fileRef, question.imageFile);
        question.imageUrl = await getDownloadURL(fileRef);
      }
    }

    // Prepare quiz data
    const quizData = {
      ...quiz.value,
      timeLimit: quiz.value.timeLimit || 60, // default 60 minutes
      maxAttempts: quiz.value.maxAttempts || 2,
      courseRef: doc(db, 'courses', quiz.value.courseId),
      createdAt: new Date(),
      totalMarks: quiz.value.questions.reduce((sum, q) => sum + q.marks, 0),
      questions: quiz.value.questions.map(q => {
        // Create a clean question object
        const cleanQuestion = {
          type: q.type,
          text: q.text,
          marks: q.marks,
          imageUrl: q.imageUrl || null,
          options: q.options,
          correctAnswer: q.correctAnswer,
          correctAnswers: q.correctAnswers
        }
        
        // Remove empty arrays for non-multi questions
        if (q.type === 'text') {
          delete cleanQuestion.options;
          delete cleanQuestion.correctAnswers;
        }
        if (q.type !== 'multi_select') {
          delete cleanQuestion.correctAnswers;
        }
        
        return cleanQuestion;
      })
    };

    await addDoc(collection(db, 'quizzes'), quizData);
    emit('created');
    emit('close');
  } catch (error) {
    console.error('Quiz creation failed:', error);
    alert(`Error creating quiz: ${error.message}`);
  }
}
  </script>

<style scoped>
/* Custom scrollbar styling */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Firefox scrollbar */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #888 #f1f1f1;
}

/* Sticky header/footer spacing */
.sticky.top-0 {
  padding-bottom: 1rem;
}
.sticky.bottom-0 {
  padding-top: 1rem;
}
</style>