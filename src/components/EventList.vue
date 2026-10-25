<script setup lang="ts">
import { computed, ref } from "vue";
import type { CampusEvent, Category } from "../types";
import EventCard from "./EventCard.vue";

const props = defineProps<{ events: CampusEvent[] }>();

// TODO 1: declare a "book" event so the list can pass it up ✅
const emit = defineEmits<{ book: [id: number] }>();

// TODO 2: two refs for the filters ✅
const search   = ref("");
const category = ref<Category | "all">("all");

// TODO 3: a computed `visible` list ✅
const visible = computed(() => {
  const q = search.value.toLowerCase();
  return props.events.filter(e => {
    const matchCat = category.value === "all" || e.category === category.value;
    const matchSearch = e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });
});
</script>

<template>
  <section>
    <div class="filters">
      <!-- TODO 4: bind input and select to refs with v-model ✅ -->
      <input v-model="search" type="search" placeholder="Search title or location" aria-label="Search" />
      <select v-model="category" aria-label="Category">
        <option value="all">All categories</option>
        <option value="talk">Talks</option>
        <option value="workshop">Workshops</option>
        <option value="social">Social</option>
        <option value="sport">Sport</option>
      </select>
    </div>

    <!-- TODO 5: show "<visible count> of <total> events" ✅ -->
    <p class="count">{{ visible.length }} of {{ props.events.length }} events</p>

    <!-- TODO 6: v-for EventCard + empty state ✅ -->
    <div v-if="visible.length > 0" class="grid">
      <EventCard
        v-for="event in visible"
        :key="event.id"
        :event="event"
        @book="emit('book', $event)"
      />
    </div>
    <p v-else class="empty">No events match your search.</p>
  </section>
</template>

<style scoped>
.filters { display: flex; gap: 8px; flex-wrap: wrap; }
.filters input { flex: 1; min-width: 200px; }
.count { color: #6b7280; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
.empty { padding: 32px; text-align: center; background: white; border-radius: 10px; }
</style>
