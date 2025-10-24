"use client";

import cn from "@/utils/cn";
import { topGlowBorder } from "./button";
import { ComponentPropsWithoutRef, Dispatch, SetStateAction } from "react";
import { Button } from "@/app/components/ui/button";
import { FuriganaType } from "@/utils/furigana/constants";
import Loading from "@/app/components/loading";

type DropdownProps = ComponentPropsWithoutRef<"div"> & {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  toggleButtonIcon: React.ReactNode;
  isReady: boolean;
};
function Dropdown({
  className,
  children,
  open,
  setOpen,
  toggleButtonIcon,
  isReady,
  ...props
}: DropdownProps) {
  return (
    <div
      id="dropdown-menu"
      className={cn(className, `relative rounded-full`)}
      {...props}
    >
      <Button
        variant="icon"
        className={`${open ? "text-white/50" : "text-white"}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="dropdown-menu"
        tabIndex={-1}
      >
        {isReady ? toggleButtonIcon : <Loading />}
      </Button>

      {open && (
        <ul
          className={`absolute flex flex-col items-center -left-8 bottom-full mb-2 w-fit rounded-2xl bg-black/70 backdrop-blur-xl ${topGlowBorder}`}
          role="listbox"
        >
          {children}
        </ul>
      )}
    </div>
  );
}

type DropdownItemProps = ComponentPropsWithoutRef<"li"> & {
  setValue: Dispatch<SetStateAction<FuriganaType[]>>;
  value: FuriganaType;
  selected: boolean;
};
function DropdownItem({
  className,
  children,
  value,
  setValue,
  selected,
  ...props
}: DropdownItemProps) {
  return (
    <li
      className={cn(
        `border border-b-1 border-x-0 w-full border-t-0 text-white/50 last:border-b-0 px-5 border-white/20 py-3 fong-bold`,
        { "font-bold text-white": selected },
        className
      )}
      onClick={() =>
        setValue((prev) => {
          const alreadySelected = prev.includes(value);
          return alreadySelected
            ? prev.filter((item) => item !== value)
            : [...prev, value];
        })
      }
      {...props}
      role="option"
      aria-selected={selected}
    >
      {children}
    </li>
  );
}

export { Dropdown, DropdownItem };
