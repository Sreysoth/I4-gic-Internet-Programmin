<script setup lang="ts">
import { computed, ref, watch } from "vue";
import EventList from "./components/EventList.vue";
import { initialEvents } from "./data/events";
import type { CampusEvent } from "./types";


const STORAGE_KEY = "campus-events:my-bookings";
// A reactive copy of the hard-coded events
const events = ref<CampusEvent[]>(initialEvents.map(e => ({ ...e })));

// TODO 1: a ref `myBookings` holding the ids of the events I booked (one entry per seat)
const myBookings = ref<number[]>([]);
// TODO 2: a computed `bookingCount`
const bookingCount = computed(() => myBookings.value.length);

// TODO 3: onBook(id): find the event; if it still has a seat,
//         increase its `booked` and add the id to myBookings
function onBook(id: number) {
  const event = events.value.find(e=> e.id=== id);
  if(!event)return;
  if(event?.booked>= event.capacity) return;
  event.booked++;
  myBookings.value.push(id);
  console.log("book", id);

}

// TODO 4 (bonus): keep my bookings after a page reload
//   - watch myBookings and save it to localStorage (JSON.stringify)
//   - read it back when the app starts, and add those seats to `booked`


// Save: runs every time myBookings changes
watch(
  myBookings,
  (ids)=>{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));

  },
  {deep: true}
);

// Load: runs once when the component is set up
function loadBookings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved: unknown = JSON.parse(raw);
    if (!Array.isArray(saved)) return;

    for (const id of saved) {
      const event = events.value.find(e => e.id === id);
      if (event && event.booked < event.capacity) {
        event.booked++;          // re-add the seat to the event
        myBookings.value.push(id); // and to my list
      }
    }
  } catch {
    // corrupted JSON: ignore it and start fresh
  }
}
loadBookings();


</script>

<template>
  <main>
    <header>
      <h1>Campus Events</h1>
      <!-- TODO 5: show the real count ("1 seat" / "N seats") -->
       <p class="mine">
        You have booked {{ bookingCount }} seat{{ bookingCount === 1 ? "" : "s" }}.
      </p>
    </header>
    <EventList :events="events" @book="onBook" />
  </main>
</template>

<style scoped>
header { margin-bottom: 16px; }
.mine { color: #6b7280; margin: 0; }
</style>
