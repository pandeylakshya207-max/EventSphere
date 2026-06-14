// Simulated offline database and authentication system
// Replacing Firebase with perfect offline-first persistence

export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export class Timestamp {
  seconds: number;
  nanoseconds: number;

  constructor(seconds: number, nanoseconds: number) {
    this.seconds = seconds;
    this.nanoseconds = nanoseconds;
  }

  static now() {
    return new Timestamp(Math.floor(Date.now() / 1000), 0);
  }

  static fromDate(date: Date) {
    return new Timestamp(Math.floor(date.getTime() / 1000), 0);
  }

  toDate() {
    return new Date(this.seconds * 1000);
  }
}

const DEFAULT_EVENTS = [
  {
    id: "event-1",
    title: "Global Tech Summit 2026",
    description: "Connect with tech pioneers and explore tomorrow's innovations at the premier tech event of the year.",
    date: { seconds: Math.floor((Date.now() + 86400000 * 3) / 1000), nanoseconds: 0 },
    location: "Metropolitan Convention Center, New York",
    category: "Tech",
    price: 199,
    capacity: 500,
    ticketsSold: 142,
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80",
    organizerId: "mock-organizer",
    organizerName: "Demo Organizer",
    createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 }
  },
  {
    id: "event-2",
    title: "Midnight Jazz & Blues Session",
    description: "An intimate night of live classic jazz and custom cocktails in a cozy, dimly lit underground lounge.",
    date: { seconds: Math.floor((Date.now() + 86400000 * 5) / 1000), nanoseconds: 0 },
    location: "The Blue Note Club, Chicago",
    category: "Music",
    price: 35,
    capacity: 120,
    ticketsSold: 98,
    imageUrl: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=1200&auto=format&fit=crop&q=80",
    organizerId: "mock-organizer",
    organizerName: "Demo Organizer",
    createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 }
  },
  {
    id: "event-3",
    title: "Modern Art & Sculpture Exhibition",
    description: "Witness avant-garde collections and beautiful masterpieces from emerging international abstract and sculpture artists.",
    date: { seconds: Math.floor((Date.now() + 86400000 * 7) / 1000), nanoseconds: 0 },
    location: "Vanguard Gallery, Los Angeles",
    category: "Art",
    price: 15,
    capacity: 200,
    ticketsSold: 45,
    imageUrl: "https://images.unsplash.com/photo-1531058020387-3be344559be6?w=1200&auto=format&fit=crop&q=80",
    organizerId: "mock-organizer",
    organizerName: "Demo Organizer",
    createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 }
  },
  {
    id: "event-4",
    title: "Taste of Tuscany: Culinary Masterclass",
    description: "Savor the essence of authentic Italian cooking with an exclusive hands-on masterclass guided by acclaimed guest chefs. Includes fine wine pairings and a curated multi-course dinner.",
    date: { seconds: Math.floor((Date.now() + 86400000 * 2) / 1000), nanoseconds: 0 },
    location: "Bella Vista Culinary Institute, San Francisco",
    category: "Food",
    price: 125,
    capacity: 40,
    ticketsSold: 22,
    imageUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&auto=format&fit=crop&q=80",
    organizerId: "mock-organizer",
    organizerName: "Demo Organizer",
    createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 }
  },
  {
    id: "event-5",
    title: "Mindfulness & Zen Sound Bath",
    description: "Recharge your energy with a deeply restorative half-day sensory wellness journey featuring guided yoga, deep sound therapy, and custom organic herbal tea tasting.",
    date: { seconds: Math.floor((Date.now() + 86400000 * 4) / 1000), nanoseconds: 0 },
    location: "Serenity Zenith Sanctuary, Malibu",
    category: "Wellness",
    price: 45,
    capacity: 75,
    ticketsSold: 38,
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&auto=format&fit=crop&q=80",
    organizerId: "mock-organizer",
    organizerName: "Demo Organizer",
    createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 }
  },
  {
    id: "event-6",
    title: "Cascade Alpine Wilderness Hike",
    description: "Embark on an inspiring guided trekking experience through alpine meadows, glacier creeks, and sweeping high-altitude lookout ridges. Perfect for photography enthusiasts.",
    date: { seconds: Math.floor((Date.now() + 86400000 * 9) / 1000), nanoseconds: 0 },
    location: "Mount Rainier Backcountry Trails, Seattle",
    category: "Adventure",
    price: 60,
    capacity: 25,
    ticketsSold: 11,
    imageUrl: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=1200&auto=format&fit=crop&q=80",
    organizerId: "mock-organizer",
    organizerName: "Demo Organizer",
    createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 }
  },
  {
    id: "event-7",
    title: "Neon Horizon Retro Arcade Championship",
    description: "Unleash your competitive spirit in a high-octane celebration of gaming history. Compete in classic arcade speedruns, pinball tournaments, and enjoy local food trucks.",
    date: { seconds: Math.floor((Date.now() + 86400000 * 12) / 1000), nanoseconds: 0 },
    location: "Pixel Arena Arcade & Lounge, Portland",
    category: "Sports",
    price: 25,
    capacity: 150,
    ticketsSold: 64,
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop&q=80",
    organizerId: "mock-organizer",
    organizerName: "Demo Organizer",
    createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 }
  }
];

const loadCollection = (collectionName: string): any[] => {
  const data = localStorage.getItem(`db_${collectionName}`);
  if (!data) {
    if (collectionName === 'events') {
      localStorage.setItem(`db_${collectionName}`, JSON.stringify(DEFAULT_EVENTS));
      return DEFAULT_EVENTS;
    }
    return [];
  }
  
  if (collectionName === 'events') {
    const parsed = JSON.parse(data);
    // Find files in DEFAULT_EVENTS that are missing in the parsed db.
    // This allows active sessions to automatically receive the rich new event seeds!
    const existingIds = new Set(parsed.map((item: any) => item.id));
    const missingEvents = DEFAULT_EVENTS.filter(def => !existingIds.has(def.id));
    if (missingEvents.length > 0) {
      const updated = [...parsed, ...missingEvents];
      localStorage.setItem(`db_events`, JSON.stringify(updated));
      return updated;
    }
    return parsed;
  }
  
  return JSON.parse(data);
};

const saveCollection = (collectionName: string, items: any[]) => {
  localStorage.setItem(`db_${collectionName}`, JSON.stringify(items));
  const listeners = activeListeners.get(collectionName) || [];
  listeners.forEach(listener => listener());
};

const activeListeners = new Map<string, Array<() => void>>();

function deserialize(data: any): any {
  if (!data) return data;
  if (Array.isArray(data)) {
    return data.map(deserialize);
  }
  if (typeof data === 'object') {
    if (typeof data.seconds === 'number' && typeof data.nanoseconds === 'number') {
      return new Timestamp(data.seconds, data.nanoseconds);
    }
    const result: any = {};
    for (const key of Object.keys(data)) {
      result[key] = deserialize(data[key]);
    }
    return result;
  }
  return data;
}

function executeQuery(queryRef: any): any[] {
  let collectionName = '';
  let constraints: any[] = [];
  
  if (queryRef.type === 'collection') {
    collectionName = queryRef.collection;
  } else if (queryRef.type === 'query') {
    collectionName = queryRef.base.collection;
    constraints = queryRef.constraints;
  }

  let items = loadCollection(collectionName);

  for (const c of constraints) {
    if (c.type === 'where') {
      const { field, operator, value } = c;
      items = items.filter(item => {
        const itemVal = item[field];
        if (operator === '==') return itemVal === value;
        if (operator === '!=') return itemVal !== value;
        if (operator === '>') return itemVal > value;
        if (operator === '>=') return itemVal >= value;
        if (operator === '<') return itemVal < value;
        if (operator === '<=') return itemVal <= value;
        return true;
      });
    } else if (c.type === 'orderBy') {
      const { field, direction } = c;
      items = [...items].sort((a, b) => {
        let valA = a[field];
        let valB = b[field];
        
        if (valA && typeof valA === 'object' && 'seconds' in valA) {
          valA = valA.seconds;
        }
        if (valB && typeof valB === 'object' && 'seconds' in valB) {
          valB = valB.seconds;
        }

        if (valA < valB) return direction === 'desc' ? 1 : -1;
        if (valA > valB) return direction === 'desc' ? -1 : 1;
        return 0;
      });
    } else if (c.type === 'limit') {
      items = items.slice(0, c.limit);
    }
  }

  return items;
}

// Authentication Logic & Simulation
const authStateListeners: Array<(user: any) => void> = [];

export const auth = {
  get currentUser() {
    const saved = localStorage.getItem('mock_user_role');
    if (!saved) return null;
    return {
      uid: `mock-${saved}`,
      displayName: `Demo ${saved.charAt(0).toUpperCase() + saved.slice(1)}`,
      email: `${saved}@demo.local`,
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${saved}`
    };
  }
};

export function onAuthStateChanged(_authInstance: any, callback: (user: any) => void) {
  authStateListeners.push(callback);
  callback(auth.currentUser);
  return () => {
    const idx = authStateListeners.indexOf(callback);
    if (idx !== -1) authStateListeners.splice(idx, 1);
  };
}

function triggerAuthStateChange(user: any) {
  if (user) {
    const role = user.uid.includes('organizer') ? 'organizer' : 'attendee';
    localStorage.setItem('mock_user_role', role);
  } else {
    localStorage.removeItem('mock_user_role');
  }
  authStateListeners.forEach(listener => listener(user));
}

export const signInWithGoogle = async () => {
  const user = {
    uid: "mock-attendee",
    displayName: "Jane Doe",
    email: "janedoe@gmail.com",
    photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane"
  };
  triggerAuthStateChange(user);
  return user;
};

export const logout = async () => {
  triggerAuthStateChange(null);
};

export const loginDemoUser = async (role: 'organizer' | 'attendee') => {
  const user = {
    uid: `mock-${role}`,
    displayName: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
    email: `${role}@demo.local`,
    photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${role}`
  };
  triggerAuthStateChange(user);
  return user;
};

// Database Mocking Models & Firestore compatibility layers
export const db = {};

export function doc(_database: any, collectionName: string, id: string) {
  return { type: 'doc', collection: collectionName, id };
}

export function collection(_database: any, collectionName: string) {
  return { type: 'collection', collection: collectionName };
}

export function query(base: any, ...constraints: any[]) {
  return { type: 'query', base, constraints };
}

export function where(field: string, operator: string, value: any) {
  return { type: 'where', field, operator, value };
}

export function orderBy(field: string, direction: 'asc' | 'desc' = 'asc') {
  return { type: 'orderBy', field, direction };
}

export function limit(count: number) {
  return { type: 'limit', limit: count };
}

export function increment(val: number) {
  return { type: 'increment', value: val };
}

export function onSnapshot(ref: any, callback: (snapshot: any) => void) {
  const collectionName = ref.collection || (ref.base && ref.base.collection);
  
  const runCallback = () => {
    if (ref.type === 'doc') {
      const items = loadCollection(collectionName);
      const item = items.find(i => i.id === ref.id);
      callback({
        exists: () => !!item,
        id: ref.id,
        data: () => item ? deserialize(item) : null
      });
    } else {
      const items = executeQuery(ref);
      callback({
        docs: items.map(item => ({
          id: item.id,
          data: () => deserialize(item)
        }))
      });
    }
  };

  runCallback();

  if (!activeListeners.has(collectionName)) {
    activeListeners.set(collectionName, []);
  }
  activeListeners.get(collectionName)!.push(runCallback);

  return () => {
    const list = activeListeners.get(collectionName) || [];
    const index = list.indexOf(runCallback);
    if (index !== -1) {
      list.splice(index, 1);
    }
  };
}

export async function getDoc(ref: any) {
  const collectionName = ref.collection;
  const docId = ref.id;
  const items = loadCollection(collectionName);
  const item = items.find(i => i.id === docId);
  return {
    exists: () => !!item,
    id: docId,
    data: () => item ? deserialize(item) : null
  };
}

export async function getDocs(queryRef: any) {
  const items = executeQuery(queryRef);
  return {
    empty: items.length === 0,
    docs: items.map(item => ({
      id: item.id,
      data: () => deserialize(item)
    }))
  };
}

export async function addDoc(collectionRef: any, data: any) {
  const collectionName = collectionRef.collection;
  const items = loadCollection(collectionName);
  const newId = `${collectionName.slice(0, -1) || 'doc'}_${Math.random().toString(36).substr(2, 9)}`;
  const newItem = { id: newId, ...data };
  
  const serializedItem = JSON.parse(JSON.stringify(newItem, (key, value) => {
    if (value instanceof Timestamp) {
      return { seconds: value.seconds, nanoseconds: value.nanoseconds };
    }
    return value;
  }));
  
  items.push(serializedItem);
  saveCollection(collectionName, items);
  
  return { id: newId };
}

export async function updateDoc(ref: any, data: any) {
  const collectionName = ref.collection;
  const docId = ref.id;
  const items = loadCollection(collectionName);
  const index = items.findIndex(i => i.id === docId);
  if (index === -1) throw new Error("Document not found");

  const currentItem = items[index];
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object' && (value as any).type === 'increment') {
      const incVal = (value as any).value;
      currentItem[key] = (Number(currentItem[key]) || 0) + incVal;
    } else if (value instanceof Timestamp) {
      currentItem[key] = { seconds: value.seconds, nanoseconds: value.nanoseconds };
    } else {
      currentItem[key] = value;
    }
  }

  items[index] = currentItem;
  saveCollection(collectionName, items);
}

export async function setDoc(ref: any, data: any, options?: { merge?: boolean }) {
  const collectionName = ref.collection;
  const docId = ref.id;
  const items = loadCollection(collectionName);
  const index = items.findIndex(i => i.id === docId);

  let updatedItem = {};
  
  const serializedData = JSON.parse(JSON.stringify(data, (key, value) => {
    if (value instanceof Timestamp) {
      return { seconds: value.seconds, nanoseconds: value.nanoseconds };
    }
    return value;
  }));

  if (index !== -1 && options?.merge) {
    updatedItem = { ...items[index], ...serializedData };
  } else {
    updatedItem = { id: docId, ...serializedData };
  }

  if (index !== -1) {
    items[index] = updatedItem;
  } else {
    items.push(updatedItem);
  }

  saveCollection(collectionName, items);
}
