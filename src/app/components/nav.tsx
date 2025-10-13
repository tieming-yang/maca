import { Home, User } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

export default function Nav() {
  return (
    <nav className="fixed bottom-5 mx-auto w-full">
      <div className="flex justify-center gap-x-5">
        <Button variant="icon">
          <Link href="/">
            <Home />
          </Link>
        </Button>
        <Button variant="icon">
          <Link href="/auth">
            <User />
          </Link>
        </Button>
      </div>
    </nav>
  );
}
