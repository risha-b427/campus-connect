import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center gap-6 border-b px-6 py-4">
      <Link href="/" className="text-xl font-bold">Campus Connect</Link>
      <Link href="/spots">Study Spots</Link>
      <Link href="/feed">Feed</Link>
      <Link href="/profile">Profile</Link>
    </nav>
  );
}