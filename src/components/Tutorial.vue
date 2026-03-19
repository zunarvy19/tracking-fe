<script setup>
import { ref } from 'vue'
import PgCard from './ui/PgCard.vue'
import PgButton from './ui/PgButton.vue'

const currentStep = ref(0)

const steps = [
  {
    title: 'Selamat Datang di CuanTrack!',
    description: 'Aplikasi manajemen keuangan pribadi yang menyenangkan dan mudah digunakan. Mari ikuti panduan singkat ini untuk memaksimalkan penggunaan aplikasi.',
    icon: 'waving_hand',
    color: 'bg-primary'
  },
  {
    title: 'Dashboard & Ringkasan',
    description: 'Di halaman utama (Dashboard), Anda dapat melihat ringkasan saldo, pemasukan, dan pengeluaran secara real-time. Informasi cepat agar selalu pegang kendali!',
    icon: 'dashboard',
    color: 'bg-accent'
  },
  {
    title: 'Mencatat Transaksi',
    description: 'Gunakan tab Transaksi untuk mencatat pengeluaran atau pemasukan baru. Jangan lupa pilih kategori yang sesuai. Sangat mudah dan berwarna!',
    icon: 'receipt_long',
    color: 'bg-secondary'
  },
  {
    title: 'Mengurus Sistem Budget',
    description: 'Cegah pengeluaran berlebih! Tetapkan batas pengeluaran bulanan untuk setiap kategori di menu Budget, dan pantau progresnya.',
    icon: 'pie_chart',
    color: 'bg-tertiary'
  },
  {
    title: 'Laporan & Analitik',
    description: 'Evaluasi kebiasaan belanja Anda melalui visualisasi grafik donut dan bar warna-warni di halaman Laporan.',
    icon: 'bar_chart',
    color: 'bg-quaternary'
  },
  {
    title: 'Siap Mengatur Keuangan?',
    description: 'Anda sudah siap menggunakan seluruh fitur CuanTrack!',
    icon: 'rocket_launch',
    color: 'bg-success'
  }
]

function nextStep() {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

function finish() {
  // Restart or just give a fun message by going to step 0
  currentStep.value = 0
}
</script>

<template>
  <div class="flex-1 overflow-y-auto p-4 md:p-8 bg-background flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
    <div class="max-w-4xl w-full mx-auto flex flex-col items-center gap-8 pb-10">
      
      <!-- Progress Bar -->
      <div class="w-full flex gap-3 px-2">
        <div 
          v-for="(step, index) in steps" 
          :key="index"
          class="h-4 flex-1 rounded-full border-2 border-foreground transition-all duration-500 ease-bounce-short cursor-pointer"
          :class="index <= currentStep ? step.color + ' pop-shadow-sm' : 'bg-muted opacity-40'"
          @click="currentStep = index"
        ></div>
      </div>

      <!-- Main Tutorial Card -->
      <PgCard class="w-full p-0 overflow-hidden bg-white relative border-4">
        <div class="relative overflow-hidden transition-all duration-500 ease-out" 
             style="min-height: 460px;">
          
          <div 
            v-for="(step, index) in steps" 
            :key="index"
            class="absolute inset-0 p-8 md:p-14 flex flex-col items-center justify-center text-center transition-all duration-500 ease-bounce-short"
            :class="[
              index === currentStep ? 'opacity-100 translate-x-0' : 
              index < currentStep ? 'opacity-0 -translate-x-full scale-95' : 'opacity-0 translate-x-full scale-95',
              index === currentStep ? 'z-10' : 'z-0 pointer-events-none'
            ]"
          >
            <!-- Big Icon Blob -->
            <div 
              class="w-40 h-40 md:w-48 md:h-48 rounded-[2rem] border-4 border-foreground flex items-center justify-center mb-8 pop-shadow transform transition-transform hover:scale-110 duration-300"
              :class="step.color"
              :style="{ borderRadius: index % 2 === 0 ? '30% 70% 70% 30% / 30% 30% 70% 70%' : '50% 50% 30% 70% / 70% 30% 70% 30%' }"
            >
              <span class="material-symbols-outlined text-[80px] md:text-[100px] text-white drop-shadow-md">{{ step.icon }}</span>
            </div>

            <!-- Text Content -->
            <h2 class="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight underline decoration-foreground decoration-4 underline-offset-8 mb-6 leading-tight">
              {{ step.title }}
            </h2>
            <p class="text-base md:text-xl font-bold text-mutedForeground tracking-wide max-w-2xl leading-relaxed">
              {{ step.description }}
            </p>
          </div>

        </div>

        <!-- Navigation Buttons -->
        <div class="px-8 py-6 border-t-4 border-foreground bg-accent/10 flex items-center justify-between">
          <PgButton 
            v-if="currentStep > 0" 
            @click="prevStep" 
            variant="ghost"
            class="min-w-[140px]"
          >
            <span class="material-symbols-outlined mr-2">arrow_back</span>
            Kembali
          </PgButton>
          <div v-else class="min-w-[140px]"></div> <!-- Spacer -->

          <div class="hidden sm:block text-sm font-extrabold uppercase tracking-widest text-foreground bg-white border-2 border-foreground px-4 py-2 rounded-full pop-shadow-sm">
            Langkah {{ currentStep + 1 }} dari {{ steps.length }}
          </div>

          <PgButton 
            v-if="currentStep < steps.length - 1" 
            @click="nextStep" 
            variant="primary"
            class="min-w-[140px]"
          >
            Lanjut
            <span class="material-symbols-outlined ml-2 text-[20px]">arrow_forward</span>
          </PgButton>
          <PgButton 
            v-else 
            @click="finish" 
            variant="primary"
            class="min-w-[140px] bg-success hover:bg-success/90 border-foreground text-foreground"
          >
            Selesai!
            <span class="material-symbols-outlined ml-2 text-[20px]">check_circle</span>
          </PgButton>
        </div>
      </PgCard>

    </div>
  </div>
</template>

<style scoped>
/* Added bounce-short custom utility in line with playful geometric tokens */
.ease-bounce-short {
  transition-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
</style>
