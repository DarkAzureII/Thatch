<!-- src/views/ProgressPage.vue -->
<template>
    <div class="container mx-auto p-6 font-sans">
      <div class="mb-6 flex flex-col md:flex-row justify-between items-start gap-4">
        <h1 class="text-3xl font-serif font-bold text-navy">
          {{ isTeacherView ? `${studentName}'s Progress` : 'My Learning Progress' }}
        </h1>
        <div class="flex gap-4">
          <select 
            v-model="selectedCourse" 
            class="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all"
          >
            <option value="all">All Courses</option>
            <option v-for="course in enrolledCourses" :key="course.id" :value="course.id">
              {{ course.name }}
            </option>
          </select>
          <select 
            v-model="selectedTimePeriod" 
            class="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold focus:border-gold outline-none transition-all"
          >
            <option value="all">All Time</option>
            <option value="1">Last Month</option>
            <option value="3">Last 3 Months</option>
            <option value="6">Last 6 Months</option>
          </select>
        </div>
      </div>
  
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto"></div>
      </div>
  
      <div v-else>
        <div v-for="course in filteredCourses" :key="course.id" class="mb-8">
          <div class="bg-white p-6 rounded-xl shadow-lg border-l-4 border-gold">
            <h3 class="text-xl font-serif font-semibold mb-6 text-navy">{{ course.name }} Progress</h3>
            <div v-if="hasCourseData(course.id)">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div class="bg-gray-50 p-6 rounded-xl">
                  <h4 class="text-sm font-medium text-gray-600 mb-2">Course Average</h4>
                  <p class="text-3xl font-bold text-navy">
                    {{ courseMetrics[course.id]?.average }}%
                  </p>
                </div>
                <div class="bg-gray-50 p-6 rounded-xl">
                  <h4 class="text-sm font-medium text-gray-600 mb-2">Improvement Trend</h4>
                  <p class="text-3xl font-bold" :class="improvementColor(courseMetrics[course.id]?.improvement)">
                    {{ courseMetrics[course.id]?.improvement }}%
                  </p>
                </div>
              </div>
              <div class="h-96">
                <LineChart 
                  :chart-data="chartData[course.id]" 
                  :options="chartOptions" 
                />
              </div>
            </div>
            <div v-else class="text-center py-6 text-gray-500">
              <DocumentTextIcon class="w-12 h-12 mx-auto text-gold mb-2" />
              <p>No submissions found for this course</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
<!-- progressPage.vue -->
<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { db, auth } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { LineChart } from 'vue-chart-3';
import { Chart, registerables } from 'chart.js';
import { DocumentTextIcon } from '@heroicons/vue/24/outline';

Chart.register(...registerables);

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true, mode: 'index', intersect: false }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      ticks: { callback: (value) => `${value}%` },
      title: { display: true, text: 'Score Percentage' },
      grid: { color: '#f0f4f8' }
    },
    x: {
      grid: { display: false },
      title: { display: true, text: 'Assessment Date' }
    }
  },
  elements: {
    line: {
      borderWidth: 3,
      tension: 0.2
    }
  }
});

const route = useRoute();
const loading = ref(true);
const studentId = ref('');
const isTeacherView = ref(false);
const studentName = ref('');
const enrolledCourses = ref([]);
const selectedCourse = ref('all');
const selectedTimePeriod = ref('all');
const courseMetrics = ref({});
const chartData = ref({});

const filteredCourses = computed(() => {
  // Combine filters based on selected course and time period
  return enrolledCourses.value.filter(course => {
    const matchesCourse = selectedCourse.value === 'all' || course.id === selectedCourse.value;
    return matchesCourse;
  });
});

const hasCourseData = (courseId) => {
  return chartData.value[courseId]?.datasets?.[0]?.data?.length > 0;
};

const improvementColor = (value) => {
  if (!value) return 'text-gray-600';
  return value > 0 ? 'text-gold' : 'text-red-600';
};
// Get current user ID
const getCurrentUserId = () => auth.currentUser?.uid;

// Fetch student data and submissions similar to assessments page
const fetchStudentProgress = async (userId) => {
  try {
    // Get enrolled courses
    const userDoc = await getDoc(doc(db, 'users', userId));
    const enrolledCourseIds = userDoc.data()?.enrolledCourses || [];
    
    if (enrolledCourseIds.length === 0) return [];

    // Get all submissions for the student
    const submissionsSnapshot = await getDocs(query(
      collection(db, 'submissions'),
      where('studentId', '==', userId)
    ));

    // Get all quizzes for enrolled courses
    const quizzesSnapshot = await getDocs(query(
      collection(db, 'quizzes'),
      where('courseId', 'in', enrolledCourseIds)
    ));

    // Process data similar to assessments page
    const courses = await Promise.all(enrolledCourseIds.map(async courseId => {
      const courseDoc = await getDoc(doc(db, 'courses', courseId));
      const courseData = courseDoc.data();
      
      // Filter quizzes for this course
      const courseQuizzes = quizzesSnapshot.docs
        .filter(quizDoc => quizDoc.data().courseId === courseId)
        .map(quizDoc => {
            const data = quizDoc.data();
            // Safe timestamp conversion like in your assessments page
            const deadline = data.deadline?.toDate 
            ? data.deadline.toDate() 
            : new Date(data.deadline);
            
            return {
            id: quizDoc.id,
            ...data,
            deadline: deadline || new Date(), // Fallback to current date if invalid
            };
        });

        // Similarly for submissions processing
        const courseSubmissions = submissionsSnapshot.docs
        .filter(subDoc => courseQuizzes.some(q => q.id === subDoc.data().quizId))
        .map(subDoc => {
            const data = subDoc.data();
            const timestamp = data.timestamp?.toDate 
            ? data.timestamp.toDate() 
            : new Date(data.timestamp);
            
            return {
            id: subDoc.id,
            ...data,
            timestamp: timestamp || new Date(), // Fallback if invalid
            percentage: (data.score / data.totalMarks) * 100,
            quizTitle: data.quizTitle
            };
        });

      return {
        id: courseId,
        name: courseData.name,
        grade: courseData.grade,
        subject: courseData.subject,
        submissions: courseSubmissions
      };
    }));

    return courses.filter(course => course.submissions.length > 0);

  } catch (error) {
    console.error('Error fetching progress:', error);
    return [];
  }
};

// Process data for charts
const processCourseData = (course) => {
  const scores = course.submissions.map(sub => sub.percentage);
  const dates = course.submissions.map(sub => 
    sub.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  );

  return {
    chartData: {
      labels: dates,
      datasets: [{
        label: 'Scores (%)',
        data: scores,
        borderColor: '#f8c822', // Gold color
        backgroundColor: '#f8c82220', // Gold with 12% opacity
        pointBackgroundColor: '#1a365d', // Navy points
        pointBorderColor: '#ffffff',
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    metrics: {
      // Corrected average calculation with proper parentheses
      average: scores.length > 0 
        ? Math.round((scores.reduce((a, b) => a + b) / scores.length)) 
        : 0,
      // Corrected improvement calculation with proper parentheses
      improvement: scores.length > 1 
        ? Math.round(((scores[scores.length - 1] - scores[0]) / scores[0] * 100)) 
        : 0
    }
  };
};

onMounted(async () => {
  try {
    const currentUserId = getCurrentUserId();
    studentId.value = route.params.studentId || currentUserId;
    isTeacherView.value = !!route.params.studentId;

    // Fetch student name if teacher view
    if (isTeacherView.value) {
      const studentDoc = await getDoc(doc(db, 'users', studentId.value));
      studentName.value = studentDoc.data()?.name || 'Student';
    }

    // Fetch progress data
    const courses = await fetchStudentProgress(studentId.value);
    
    // Process data for charts
    courses.forEach(course => {
      const processed = processCourseData(course);
      chartData.value[course.id] = processed.chartData;
      courseMetrics.value[course.id] = processed.metrics;
    });

    enrolledCourses.value = courses;

  } catch (error) {
    console.error('Error initializing progress:', error);
  } finally {
    loading.value = false;
  }
});
</script>