import { CreditRole } from "@/data/models/Credit";
import {
  FormErrors,
  INPUT_CLASS,
  SongFormData,
} from "../[slug]/client-song-edit-page";
import { Dispatch, SetStateAction } from "react";
import { PeopleRow } from "@/data/models/People";

type Props = {
  formData: SongFormData;
  role: CreditRole;
  people: PeopleRow[];
  errors: FormErrors;
  isPeopleLoading: boolean;
  isNew: boolean;
  setFormData: Dispatch<SetStateAction<SongFormData>>;
  setErrors: Dispatch<SetStateAction<FormErrors>>;
  setIsDirty: Dispatch<SetStateAction<boolean>>;
};

export default function PeopleSelect({
  formData,
  role,
  errors,
  people,
  isPeopleLoading,
  isNew,
  setFormData,
  setErrors,
  setIsDirty,
}: Props) {
  const artists = formData[role];
  return (
    <>
      {artists.map((artist, index) => {
        const { id, display_name } = artist;
        return (
          <div
            className="grid gap-1"
            key={id ? `${role}-${id}` : `${role}-placeholder-${index}`}
          >
            <label
              htmlFor={`${role}.display_name`}
              className="text-xs font-semibold uppercase tracking-wide text-zinc-400"
            >
              <p>{role}</p>
            </label>
            {errors[role] && (
              <p className="text-xs text-rose-400">{errors[role]}</p>
            )}

            <select
              name={`${role}_options`}
              id={`${role}.display_name`}
              className={INPUT_CLASS}
              value={display_name ?? ""}
              onChange={(e) => {
                if (isPeopleLoading) {
                  return;
                }
                const selected = people?.find(
                  (p) => p.display_name === e.target.value
                );
                if (!selected) return;

                setFormData((prev) => {
                  const next = [...prev[role]];
                  const previous = next[index];
                  const { id, display_name, romaji, furigana } = selected;
                  next[index] = {
                    id,
                    display_name,
                    romaji,
                    furigana,
                    creditId: previous?.creditId,
                  };

                  return {
                    ...prev,
                    [role]: next,
                  };
                });

                setErrors((prev) => ({
                  ...prev,
                  [role]: undefined,
                }));
                setIsDirty(true);
              }}
            >
              {isNew && (
                <option value="" disabled>
                  Select a person…
                </option>
              )}
              
              {people?.map((p) => (
                <option value={p.display_name} key={p.id}>
                  {p.display_name}
                </option>
              ))}
            </select>
          </div>
        );
      })}
    </>
  );
}
