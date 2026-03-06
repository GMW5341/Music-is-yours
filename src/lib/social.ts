import { v4 as uuidv4 } from "uuid";
import { Contact, ShareTarget, Song, UserProfile } from "@/types/music";

// Simulated contact store (in production, this would connect to phone contacts API)
const SAMPLE_CONTACTS: Contact[] = [
  { id: "c1", name: "김민수", phone: "010-1234-5678", isFriend: true },
  { id: "c2", name: "이서연", email: "seoyeon@example.com", isFriend: true },
  { id: "c3", name: "박지훈", phone: "010-9876-5432", isFriend: false },
  { id: "c4", name: "최예린", email: "yerin@example.com", isFriend: true },
  { id: "c5", name: "정우진", phone: "010-5555-1234", isFriend: false },
  { id: "c6", name: "한소희", email: "sohee@example.com", isFriend: true },
];

let currentUser: UserProfile = {
  id: "user-1",
  name: "나",
  songs: [],
  contacts: SAMPLE_CONTACTS,
  competitions: [],
};

export function getCurrentUser(): UserProfile {
  return currentUser;
}

export function getContacts(): Contact[] {
  return currentUser.contacts;
}

export function getFriends(): Contact[] {
  return currentUser.contacts.filter((c) => c.isFriend);
}

export function addContact(contact: Omit<Contact, "id">): Contact {
  const newContact: Contact = { ...contact, id: uuidv4() };
  currentUser.contacts.push(newContact);
  return newContact;
}

export function toggleFriend(contactId: string): void {
  const contact = currentUser.contacts.find((c) => c.id === contactId);
  if (contact) {
    contact.isFriend = !contact.isFriend;
  }
}

export interface SharedSong {
  id: string;
  song: Song;
  sharedBy: string;
  sharedTo: ShareTarget;
  sharedAt: string;
  message?: string;
}

const sharedSongs: SharedSong[] = [];

export function shareSong(song: Song, target: ShareTarget, message?: string): SharedSong {
  const shared: SharedSong = {
    id: uuidv4(),
    song,
    sharedBy: currentUser.name,
    sharedTo: target,
    sharedAt: new Date().toISOString(),
    message,
  };
  sharedSongs.push(shared);
  return shared;
}

export function getSharedSongs(): SharedSong[] {
  return sharedSongs;
}

export function getCommunityFeed(): SharedSong[] {
  return sharedSongs.filter((s) => s.sharedTo.type === "community");
}

export function generateShareLink(songId: string): string {
  return `https://music-is-yours.app/share/${songId}`;
}

export function searchContacts(query: string): Contact[] {
  const lower = query.toLowerCase();
  return currentUser.contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(lower) ||
      c.email?.toLowerCase().includes(lower) ||
      c.phone?.includes(query)
  );
}
