"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InsertRow, Song, SongBundle, UpdateRow } from "@/data/models/Song";
import { Work, WorkInsert, WorkKind, WorkUpdate } from "@/data/models/Work";
import { Line, LineInsert, LineRow, LinesUpdate } from "@/data/models/Line";
import { QueryKey } from "@/data/query-keys";
import { Song as LegacySong } from "@/songs/Song";
import Loading from "@/app/components/loading";
import { People, PeopleInsert, PeopleRow } from "@/data/models/People";
import {
  Credit,
  CreditPerson,
  CreditUpdate,
  FormattedCredit,
} from "@/data/models/Credit";
import { Button } from "@/app/components/ui/button";
import { ArrowLeft, Plus, X, FilePlus, Bomb } from "lucide-react";
import PeopleSelect from "../components/people-select";
import { toast } from "sonner";

const NEW_SLUG_SENTINEL = "new";
export const PANEL_CLASS =
  "rounded-2xl border border-zinc-800 bg-zinc-950/10 shadow-[0_25px_55px_-40px_rgba(12,12,12,1)]";
export const INPUT_CLASS =
  "rounded-full border border-zinc-700 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-900/50";
const WORK_KIND_OPTIONS: WorkKind[] = [
  "movie",
  "anime",
  "tv",
  "game",
  "album",
  "single",
  "stage",
  "other",
];

export type SongFormData = {
  id?: string;
  name: string;
  romaji: string;
  slug: string;
  youtube_id: string;
  end_seconds: string;
  furigana: string;
  work_id: string;
  work_title: string;
  work_romaji: string;
  work_furigana: string;
  work_kind: WorkKind;
  work_year: string;
  lines: LineRow[] | LineInsert[];
} & FormattedCredit;

export type FormErrors = Partial<Record<keyof SongFormData | "base", string>>;
type PersonFormErrors = Partial<Record<keyof PeopleInsert | "base", string>>;

type WorkAction =
  | { kind: "none"; workId: string | null }
  | { kind: "create"; payload: WorkInsert }
  | { kind: "update"; id: string; payload: WorkUpdate }
  | { kind: "unlink" };

type WorkFormSnapshot = {
  id: string;
  title: string;
  romaji: string;
  furigana: string;
  kind: WorkKind;
  year: string;
};

type ValidationOptions = {
  isNew: boolean;
  initialWorkId: string | null;
  initialWorkSnapshot: WorkFormSnapshot | null;
  hasWork: boolean;
};

type ValidationResult = {
  errors: FormErrors;
  sanitizedSlug: string;
  songInsert?: InsertRow;
  songUpdate?: UpdateRow;
  workAction: WorkAction;
  credit: CreditMutationPlan;
  lines: LinesMutationPlan;
};

const makeBlankCreditPerson = (): CreditPerson => ({
  id: "",
  display_name: "",
  furigana: "",
  romaji: "",
  creditId: undefined,
});

const makeEmptyCreditBuckets = (): FormattedCredit => ({
  primary_artist: [],
  featured_artist: [],
  composer: [],
  lyricist: [],
});

function makeBlankSong(): SongFormData {
  return {
    name: "",
    romaji: "",
    slug: "",
    youtube_id: "",
    end_seconds: "",
    furigana: "",
    work_id: "",
    work_title: "",
    work_romaji: "",
    work_furigana: "",
    work_kind: "single",
    work_year: "",
    primary_artist: [makeBlankCreditPerson()],
    featured_artist: [makeBlankCreditPerson()],
    composer: [makeBlankCreditPerson()],
    lyricist: [makeBlankCreditPerson()],
    lines: [],
  };
}

function mapRowToForm(row: SongBundle): SongFormData {
  const endSeconds = row.end_seconds;
  const work = row.work;
  const credit = row.credit;

  return {
    id: row.id,
    name: row.name ?? "",
    romaji: row.romaji ?? "",
    slug: row.slug ?? row.romaji?.toLowerCase() ?? "",
    youtube_id: row.youtube_id ?? "",
    end_seconds:
      typeof endSeconds === "number" && !Number.isNaN(endSeconds)
        ? LegacySong.secondsToTimestamp(endSeconds)
        : "",
    furigana: row.furigana ?? "",
    work_id: row.work?.id ?? "",
    work_title: work?.title ?? "",
    work_romaji: work?.romaji ?? "",
    work_furigana: work?.furigana ?? "",
    work_kind: work?.kind ?? "single",
    work_year: work?.year ? String(work.year) : "",
    primary_artist: credit.primary_artist,
    featured_artist: credit.featured_artist,
    composer: credit.composer,
    lyricist: credit.lyricist,
    lines: row.lines,
  };
}

function parseEndSeconds(value: string): {
  endSeconds: number | null;
  error?: string;
} {
  const trimmed = value.trim();
  if (!trimmed) {
    return { endSeconds: null };
  }

  if (/^\d+:\d{1,2}$/.test(trimmed)) {
    return { endSeconds: LegacySong.timestampToSeconds(trimmed) };
  }

  const numeric = Number(trimmed);
  if (Number.isNaN(numeric)) {
    return {
      endSeconds: null,
      error: "End seconds must be a number or mm:ss.",
    };
  }

  if (numeric < 0) {
    return { endSeconds: null, error: "End seconds cannot be negative." };
  }

  return { endSeconds: numeric };
}

type SongSectionResult = {
  name: string;
  romaji?: string;
  sanitizedSlug: string;
  youtubeId: string | null;
  endSeconds: number | null;
  furigana?: string;
};

function validateSongSection(
  values: SongFormData,
  errors: FormErrors
): SongSectionResult {
  const name = values.name.trim();
  if (!name) {
    errors.name = "Name is required.";
  }

  const slug = values.slug.trim();
  if (!slug) {
    errors.slug = "Slug is required.";
  }

  const youtubeValue = values.youtube_id.trim();
  let youtubeId: string | null = null;
  if (youtubeValue.length > 0) {
    const youtubeRegex = /^[A-Za-z0-9_-]{6,15}$/;
    if (!youtubeRegex.test(youtubeValue)) {
      errors.youtube_id =
        "YouTube ID should be 6-15 characters (letters, numbers, - or _).";
    } else {
      youtubeId = youtubeValue;
    }
  }

  const parsed = parseEndSeconds(values.end_seconds);
  if (parsed.error) {
    errors.end_seconds = parsed.error;
  }

  const furigana = values.furigana.trim();

  return {
    name,
    sanitizedSlug: Song.toSlug(slug),
    youtubeId,
    endSeconds: parsed.endSeconds,
    furigana,
  };
}

function determineWorkAction(
  values: SongFormData,
  options: ValidationOptions,
  errors: FormErrors
): WorkAction {
  function toNullable(id?: string | null): string | null {
    return id && id.length > 0 ? id : null;
  }

  if (!options.hasWork) {
    if (options.initialWorkId) {
      return { kind: "unlink" };
    }
    return { kind: "none", workId: null };
  }

  const workId = values.work_id.trim();
  const workTitle = values.work_title.trim();
  const workRomaji = values.work_romaji.trim();
  const workFurigana = values.work_furigana.trim();
  const workYearRaw = values.work_year.trim();

  let work_year: number | null = null;
  if (workYearRaw.length > 0) {
    const parsedYear = Number(workYearRaw);
    if (Number.isNaN(parsedYear)) {
      errors.work_year = "Year must be a number.";
    } else {
      work_year = parsedYear;
    }
  }

  const hasDetails =
    workTitle.length > 0 ||
    workRomaji.length > 0 ||
    workFurigana.length > 0 ||
    workYearRaw.length > 0;

  const snapshot = options.initialWorkSnapshot;
  const matchesSnapshot = Boolean(
    snapshot &&
      snapshot.id === workId &&
      snapshot.title === workTitle &&
      snapshot.romaji === workRomaji &&
      snapshot.furigana === workFurigana &&
      snapshot.kind === values.work_kind &&
      snapshot.year === workYearRaw
  );

  if (workId.length > 0) {
    if (!hasDetails || matchesSnapshot) {
      return { kind: "none", workId: toNullable(workId) };
    }

    if (!workTitle) {
      errors.work_title =
        "Work title is required when editing an existing work.";
      return { kind: "none", workId: toNullable(workId) };
    }

    return {
      kind: "update",
      id: workId,
      payload: {
        title: workTitle || undefined,
        romaji: workRomaji || null,
        furigana: workFurigana || null,
        kind: values.work_kind,
        year: work_year,
      },
    };
  }

  if (!hasDetails) {
    return { kind: "none", workId: toNullable(options.initialWorkId) };
  }

  if (!workTitle) {
    errors.work_title = "Work title is required.";
    return { kind: "none", workId: toNullable(options.initialWorkId) };
  }

  return {
    kind: "create",
    payload: {
      title: workTitle,
      romaji: workRomaji || null,
      furigana: workFurigana || null,
      kind: values.work_kind,
      year: work_year,
    },
  };
}

type CreditMutationPlan = {
  inserts: FormattedCredit;
  updates: CreditUpdate[];
};
function validateCreditSection(
  values: SongFormData,
  _options: ValidationOptions,
  errors: FormErrors
): CreditMutationPlan {
  const { primary_artist, composer, lyricist } = values;
  if (
    primary_artist.length <= 0 ||
    primary_artist.some((person) => !person.id)
  ) {
    errors.primary_artist = "Select at least one primary artist.";
  }
  if (composer.length <= 0 || composer.some((person) => !person.id)) {
    errors.composer = "Select at least one composer.";
  }
  if (lyricist.length <= 0 || lyricist.some((person) => !person.id)) {
    errors.lyricist = "Select at least one lyricist.";
  }

  const plan: CreditMutationPlan = {
    inserts: makeEmptyCreditBuckets(),
    updates: [],
  };

  Credit.CREDIT_ROLE_VALUES.forEach((role) => {
    const bucket = values[role];
    bucket.forEach((person, index) => {
      if (!person) {
        return;
      }
      if (person.creditId) {
        plan.updates.push({
          song_id: values.id,
          person_id: person.id,
          role,
          position: index,
          id: person.creditId,
        });
        return;
      }

      plan.inserts[role][index] = person;
    });
  });

  return plan;
}

type LinesMutationPlan = {
  inserts: LineInsert[];
  updates: LinesUpdate[];
};

function validateLinesSection(
  values: SongFormData,
  _options: ValidationOptions,
  errors: FormErrors
): LinesMutationPlan {
  const { lines } = values;
  if (lines.length === 0) {
    errors.lines = "No lines";
  }

  const plan: LinesMutationPlan = {
    inserts: [],
    updates: [],
  };

  for (const line of lines) {
    const trimedLyric = line.lyric;

    if (line.id && typeof line.id === "number") {
      const { timestamp_sec } = line;
      const update = {
        ...line,
        lyric: trimedLyric,
        timestamp_sec,
      };

      plan.updates.push(update);
    } else {
      const { timestamp_sec } = line;
      const insert = {
        lyric: trimedLyric,
        timestamp_sec,
        song_id: values.id!,
      };

      plan.inserts.push(insert);
    }
  }

  return plan;
}

function validateForm(
  values: SongFormData,
  options: ValidationOptions
): ValidationResult {
  const errors: FormErrors = {};

  const songSection = validateSongSection(values, errors);
  const workAction = determineWorkAction(values, options, errors);
  const credit = validateCreditSection(values, options, errors);
  const lines = validateLinesSection(values, options, errors);

  if (options.isNew && workAction.kind === "none" && !workAction.workId) {
    errors.base = "Provide a new work or link an existing work ID.";
  }

  if (Object.keys(errors).length > 0 || !songSection.sanitizedSlug) {
    return {
      errors,
      sanitizedSlug: songSection.sanitizedSlug,
      workAction,
      credit,
      lines,
    };
  }

  const basePayload = {
    name: songSection.name,
    romaji: songSection.romaji,
    slug: songSection.sanitizedSlug,
    youtube_id: songSection.youtubeId,
    end_seconds: songSection.endSeconds,
    furigana: songSection.furigana || null,
  };

  const songInsert: InsertRow = {
    ...basePayload,
    work_id:
      workAction.kind === "create"
        ? null
        : workAction.kind === "update"
        ? workAction.id
        : workAction.kind === "none"
        ? workAction.workId ?? null
        : null,
  };

  const songUpdate: UpdateRow = {
    ...basePayload,
    work_id:
      workAction.kind === "create"
        ? null
        : workAction.kind === "update"
        ? workAction.id
        : workAction.kind === "none"
        ? workAction.workId ?? null
        : null,
  };

  if (workAction.kind === "unlink") {
    songInsert.work_id = null;
    songUpdate.work_id = null;
  }

  return {
    errors,
    sanitizedSlug: songSection.sanitizedSlug,
    songInsert,
    songUpdate,
    workAction,
    credit,
    lines,
  };
}

type SaveInput =
  | {
      kind: "create";
      song: InsertRow;
      workAction: WorkAction;
      credit: FormattedCredit;
      lines: LineInsert[];
    }
  | {
      kind: "update";
      id: string;
      previousSlug: string;
      song: UpdateRow;
      workAction: WorkAction;
      credit: CreditMutationPlan;
      lines: LinesMutationPlan;
    };

type ModalStatus = "addPerson" | "idel" | "batchAddLyrics";

export default function ClientSongEditPage({ slug }: { slug: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const isNew = slug === NEW_SLUG_SENTINEL;

  const storageKey = useMemo(() => `maca:formData:${slug || "new"}`, [slug]);

  const [formData, setFormData] = useState<SongFormData>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : makeBlankSong();
    } catch {
      return makeBlankSong();
    }
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [initialWork_id, setInitialWork_id] = useState<string | null>(null);
  const [initialWorkSnapshot, setInitialWorkSnapshot] =
    useState<WorkFormSnapshot | null>(null);
  const [hasWork, setHasWork] = useState<boolean>(true);
  const [modal, setModal] = useState<ModalStatus>("idel");

  const [personData, setPersonData] = useState<CreditPerson>(
    makeBlankCreditPerson
  );
  const [personErrors, setPersonErrors] = useState<PersonFormErrors>({});

  const [editingField, setEditingField] = useState<"timestamp" | "none">(
    "none"
  );

  const lyricsTextareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    data: song,
    isLoading,
    error: fetchError,
  } = useQuery<SongBundle>({
    queryKey: QueryKey.song(slug),
    queryFn: () => Song.getBundle(slug),
    enabled: !isNew,
    staleTime: 60_000,
  });

  const {
    data: people,
    isLoading: isPeopleLoading,
    error: fetchPeopleError,
  } = useQuery<PeopleRow[]>({
    queryKey: QueryKey.people(),
    queryFn: () => People.getAll(),
    staleTime: 60_000,
  });

  const disableInputs = !isNew && (isLoading || Boolean(fetchError));

  useEffect(() => {
    if (!isNew && !formData.name) return;
    if (isNew && !isDirty) return;

    localStorage.setItem(storageKey, JSON.stringify(formData));
  }, [formData, storageKey, formData.lines, isDirty, isNew]);

  useEffect(() => {
    if (!isNew && song) {
      let songData = makeBlankSong();
      const draft = localStorage.getItem(storageKey);
      if (draft) {
        songData = JSON.parse(draft);
      } else {
        songData = mapRowToForm(song);
      }
      setFormData(songData);
      setErrors({});
      setIsDirty(false);
      setInitialWork_id(song.work?.id ?? null);
      setHasWork(Boolean(song.work?.id));
      setInitialWorkSnapshot(
        song.work?.id
          ? {
              id: song.work.id,
              title: songData.work_title,
              romaji: songData.work_romaji,
              furigana: songData.work_furigana,
              kind: songData.work_kind,
              year: songData.work_year,
            }
          : null
      );
    }
  }, [isNew, song, storageKey]);

  useEffect(() => {
    if (isNew) {
      setErrors({});
      setIsDirty(false);
      setInitialWork_id(null);
      setInitialWorkSnapshot(null);
    }
  }, [isNew]);

  const saveMutation = useMutation({
    mutationFn: async (input: SaveInput) => {
      let workId: string | null = null;

      switch (input.workAction.kind) {
        case "create": {
          if (!hasWork) {
            workId = null;
            break;
          }

          const existedWork = await Work.getByName(
            input.workAction.payload.title
          );
          if (!existedWork?.id) {
            const created = await Work.create(input.workAction.payload);
            workId = created.id;
          } else {
            workId = existedWork.id;
          }

          break;
        }
        case "update": {
          if (hasWork) {
            await Work.update(input.workAction.id, input.workAction.payload);
          }
          workId = input.workAction.id;
          break;
        }
        case "none": {
          workId = input.workAction.workId ?? null;
          break;
        }
        case "unlink":
        default: {
          workId = null;
        }
      }

      let slugToFetch = null;

      switch (input.kind) {
        case "create":
          const inserted = await Song.insert({
            ...input.song,
            work_id: workId,
          });

          await Credit.insert(inserted.id, input.credit);

          await Line.insertMany(
            input.lines.map((line) => ({
              ...line,
              song_id: inserted.id,
            }))
          );

          return Song.getBundle(inserted.slug);

        case "update":
          const updated = await Song.update(input.id, {
            ...input.song,
            work_id: workId,
          });

          const { inserts, updates } = input.credit;
          await Credit.insert(input.id, inserts);
          if (updates.length > 0) {
            await Credit.update(updates);
          }

          const { inserts: lineInserts, updates: lineUpdates } = input.lines;
          await Line.insertMany(lineInserts);

          if (lineUpdates.length > 0) {
            await Line.updateMany(lineUpdates);
          }

          slugToFetch = updated.slug ?? input.song.slug ?? input.previousSlug;
      }

      return Song.getBundle(slugToFetch);
    },
    onSuccess: (refreshed, input) => {
      queryClient.invalidateQueries({ queryKey: QueryKey.songs() });
      queryClient.setQueryData(QueryKey.song(refreshed.slug), refreshed);
      if (refreshed.work?.id) {
        queryClient.invalidateQueries({
          queryKey: QueryKey.work(refreshed.work.id),
        });
      }

      const mapped = mapRowToForm(refreshed);
      setFormData(mapped);
      setErrors({});
      setIsDirty(false);
      setInitialWork_id(refreshed.work?.id ?? null);
      setHasWork(Boolean(refreshed.work?.id));
      setInitialWorkSnapshot(
        refreshed.work?.id
          ? {
              id: refreshed.work.id,
              title: mapped.work_title,
              romaji: mapped.work_romaji,
              furigana: mapped.work_furigana,
              kind: mapped.work_kind,
              year: mapped.work_year,
            }
          : null
      );

      localStorage.removeItem(storageKey);

      if (input.kind === "update") {
        if (refreshed.slug !== input.previousSlug) {
          queryClient.removeQueries({
            queryKey: QueryKey.song(input.previousSlug),
          });
          router.replace(`/edit/${encodeURIComponent(refreshed.slug)}`);
        }
      } else {
        router.replace(`/edit/${encodeURIComponent(refreshed.slug)}`);
      }

      toast.success("Updated");
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Unable to save the song.";
      setErrors((prev) => ({ ...prev, base: message }));
      toast.error(errors.base, {
        description: message,
      });
    },
  });

  const addPersonMutation = useMutation({
    mutationFn: async (input: PeopleInsert) => {
      const person = await People.insert(input);
      return person;
    },
    onSuccess: (refreshed) => {
      queryClient.invalidateQueries({ queryKey: QueryKey.people() });
      queryClient.setQueryData(QueryKey.person(refreshed.id), refreshed);
      setPersonData(makeBlankCreditPerson)
      setModal("idel");

      toast.success("Person Added");
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Unable to add the person.";
      setErrors((prev) => ({ ...prev, base: message }));
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => Song.deleteSong(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKey.songs() });
      router.replace("/edit");
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Unable to delete the song.";
      setErrors((prev) => ({ ...prev, base: message }));
      toast.error(message);
    },
  });

  const deleteLineMutation = useMutation({
    mutationFn: async (id: number) => Line.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKey.song(slug) });
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Unable to add the person.";
      setErrors((prev) => ({ ...prev, base: message }));
    },
  });

  const deleteAllLinesMutation = useMutation({
    mutationFn: async (songId: string) => Line.deleteAll(songId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKey.song(slug) });
      toast.success("Deleted All Lines!");
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Unable to add the person.";
      setErrors((prev) => ({ ...prev, base: message }));
      toast.error(message);
    },
  });

  function handleInputChange(field: keyof SongFormData) {
    return function (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) {
      const value = event.target.value;
      setFormData((prev) => {
        switch (field) {
          default:
            return { ...prev, [field]: value };
        }
      });

      setErrors((prev) => ({ ...prev, [field]: undefined }));
      setIsDirty(true);
    };
  }

  function handlePersonInputChange(field: keyof PeopleInsert) {
    return (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const value = event.target.value;

      setPersonData((prev) => {
        switch (field) {
          case "display_name":
            return { ...prev, display_name: value };
          case "furigana":
            return { ...prev, furigana: value };
          case "romaji":
            return { ...prev, romaji: value };
          default:
            return prev;
        }
      });
    };
  }

  const handleWorkKindChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as WorkKind;
    setFormData((prev) => ({ ...prev, work_kind: value }));
    setErrors((prev) => ({ ...prev, work_kind: undefined }));
    setIsDirty(true);
  };

  const handleHasWorkToggle = (event: ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    setHasWork(checked);
    setErrors((prev) => ({
      ...prev,
      work_id: undefined,
      work_title: undefined,
      work_romaji: undefined,
      work_furigana: undefined,
      work_kind: undefined,
      work_year: undefined,
    }));
    setIsDirty(true);
  };

  const handleSave = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    const validation = validateForm(formData, {
      isNew,
      initialWorkId: initialWork_id,
      initialWorkSnapshot,
      hasWork,
    });
    setErrors(validation.errors);

    if (
      validation.sanitizedSlug &&
      validation.sanitizedSlug !== formData.slug
    ) {
      setFormData((prev) => ({ ...prev, slug: validation.sanitizedSlug! }));
    }

    if (Object.keys(validation.errors).length > 0) {
      return;
    }

    if (isNew) {
      if (!validation.songInsert) {
        setErrors((prev) => ({
          ...prev,
          base: "Unable to build song payload.",
        }));
        return;
      }
      saveMutation.mutate({
        kind: "create",
        song: validation.songInsert,
        workAction: validation.workAction,
        credit: validation.credit.inserts,
        lines: validation.lines.inserts,
      });
      return;
    }

    if (!formData.id) {
      setErrors((prev) => ({ ...prev, base: "Missing song identifier." }));
      return;
    }

    if (!validation.songUpdate) {
      setErrors((prev) => ({
        ...prev,
        base: "Unable to build update payload.",
      }));
      return;
    }

    saveMutation.mutate({
      kind: "update",
      id: formData.id,
      previousSlug: slug,
      song: validation.songUpdate,
      workAction: validation.workAction,
      credit: validation.credit,
      lines: validation.lines,
    });
  };

  const handleDelete = async () => {
    if (!formData.id) {
      setErrors((prev) => ({ ...prev, base: "Missing song identifier." }));
      return;
    }

    const confirmed = window.confirm(
      `Delete "${formData.name || formData.slug}"? This cannot be undone.`
    );
    if (!confirmed) return;

    deleteMutation.mutate(formData.id);
  };

  const pageTitle = useMemo(() => {
    if (isNew) return "Create Song";
    if (song) return `Edit ${song.name}`;
    return "Edit Song";
  }, [isNew, song]);

  const renderLines = useMemo(() => {
    const lines = [...formData.lines];
    if (editingField === "timestamp") return lines;
    formData.lines = lines.sort((a, b) => a.timestamp_sec - b.timestamp_sec);
    return formData.lines;
  }, [editingField, formData]);

  return (
    <section className="w-full font-mono max-w-3xl mx-auto space-y-6 py-8 text-zinc-100 px-3">
      {(isLoading || saveMutation.isPending) && <Loading isFullScreen />}

      <header className={`${PANEL_CLASS} space-y-1 p-6`}>
        <h1 className="text-3xl font-semibold">{pageTitle}</h1>
        {!isNew && song && (
          <p className="text-sm text-zinc-400">
            ID: {song.id} · Created{" "}
            {new Date(song.created_at!).toLocaleString()}
          </p>
        )}
      </header>
      {fetchError && !isNew && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          Failed to load song data. Please try again.
        </div>
      )}

      {errors.base && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          {errors.base}
        </div>
      )}

      <form
        className={`${PANEL_CLASS} space-y-5 p-6`}
        onSubmit={handleSave}
        noValidate
      >
        {/* Basic Info */}
        <div className="grid gap-1">
          <label
            htmlFor="name"
            className="text-xs font-semibold uppercase tracking-wide text-zinc-400"
          >
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange("name")}
            className={INPUT_CLASS}
            placeholder="千本桜"
            required
            disabled={disableInputs}
          />
          {errors.name && (
            <p className="text-xs text-rose-400">{errors.name}</p>
          )}
        </div>

        <div className="grid gap-1">
          <label
            htmlFor="slug"
            className="text-xs font-semibold uppercase tracking-wide text-zinc-400"
          >
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            value={formData.slug}
            onChange={handleInputChange("slug")}
            required
            className={`${INPUT_CLASS} opacity-70`}
          />
        </div>

        <div className="grid gap-1">
          <label
            htmlFor="youtube_id"
            className="text-xs font-semibold uppercase tracking-wide text-zinc-400"
          >
            YouTube ID
          </label>
          <input
            id="youtube_id"
            name="youtube_id"
            type="text"
            value={formData.youtube_id}
            onChange={handleInputChange("youtube_id")}
            className={INPUT_CLASS}
            placeholder="dQw4w9WgXcQ"
            disabled={disableInputs}
          />
          {errors.youtube_id && (
            <p className="text-xs text-rose-400">{errors.youtube_id}</p>
          )}
        </div>

        <div className="grid gap-1">
          <label
            htmlFor="end_seconds"
            className="text-xs font-semibold uppercase tracking-wide text-zinc-400"
          >
            End Timestamp (seconds or mm:ss)
          </label>
          <input
            id="end_seconds"
            name="end_seconds"
            type="text"
            value={formData.end_seconds}
            onChange={handleInputChange("end_seconds")}
            className={INPUT_CLASS}
            placeholder="04:21"
            disabled={disableInputs}
          />
          {errors.end_seconds && (
            <p className="text-xs text-rose-400">{errors.end_seconds}</p>
          )}
        </div>

        <div className="grid gap-1">
          <label
            htmlFor="furigana"
            className="text-xs font-semibold uppercase tracking-wide text-zinc-400"
          >
            Furigana
          </label>
          <input
            id="furigana"
            name="furigana"
            type="text"
            value={formData.furigana}
            onChange={handleInputChange("furigana")}
            className={INPUT_CLASS}
            disabled={disableInputs}
          />
          {errors.furigana && (
            <p className="text-xs text-rose-400">{errors.furigana}</p>
          )}
        </div>
        <div className="grid gap-1">
          <label
            htmlFor="romaji"
            className="text-xs font-semibold uppercase tracking-wide text-zinc-400"
          >
            Romaji
          </label>
          <input
            id="romaji"
            name="romaji"
            type="text"
            value={formData.romaji}
            onChange={handleInputChange("romaji")}
            className={INPUT_CLASS}
            placeholder="Senbonzakura"
            disabled={disableInputs}
          />
          {errors.romaji && (
            <p className="text-xs text-rose-400">{errors.romaji}</p>
          )}
        </div>

        {/* Add Person */}
        <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
          <div className="flex justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">
              Credit Details
            </h2>
            <Button
              type="button"
              variant="primary"
              onMouseDown={() =>
                setModal((model) =>
                  model === "addPerson" ? "idel" : "addPerson"
                )
              }
            >
              Add
            </Button>

            <dialog
              open={modal === "addPerson"}
              className={`${PANEL_CLASS} text-white space-y-5 p-6 mx-auto w-full max-w-3xl backdrop-blur-2xl`}
            >
              <div className="flex justify-between">
                <p>Add Person</p>
                <Button
                  type="button"
                  variant="icon"
                  onMouseDown={() =>
                    setModal((model) =>
                      model === "addPerson" ? "idel" : "addPerson"
                    )
                  }
                >
                  <X />
                </Button>
              </div>

              <div className="space-y-5">
                <div className="grid gap-1">
                  <label
                    htmlFor="display_name"
                    className="text-xs font-semibold uppercase tracking-wide text-zinc-400"
                  >
                    Display Name
                  </label>
                  <input
                    id="display_name"
                    name="display_name"
                    type="text"
                    value={personData.display_name!}
                    onChange={handlePersonInputChange("display_name")}
                    className={INPUT_CLASS}
                    placeholder="Artist Name"
                    disabled={disableInputs}
                  />
                  {personErrors.display_name && (
                    <p className="text-xs text-rose-400">
                      {personErrors.display_name}
                    </p>
                  )}
                </div>
                <div className="grid gap-1">
                  <label
                    htmlFor="furigana"
                    className="text-xs font-semibold uppercase tracking-wide text-zinc-400"
                  >
                    Furigana
                  </label>
                  <input
                    id="furigana"
                    name="furigana"
                    type="text"
                    value={personData.furigana ?? ""}
                    onChange={handlePersonInputChange("furigana")}
                    className={INPUT_CLASS}
                    placeholder="Furigana"
                    disabled={disableInputs}
                  />
                  {personErrors.furigana && (
                    <p className="text-xs text-rose-400">
                      {personErrors.furigana}
                    </p>
                  )}
                </div>
                <div className="grid gap-1">
                  <label
                    htmlFor="romaji"
                    className="text-xs font-semibold uppercase tracking-wide text-zinc-400"
                  >
                    Romaji
                  </label>
                  <input
                    id="romaji"
                    name="romaji"
                    type="text"
                    value={personData.romaji ?? ""}
                    onChange={handlePersonInputChange("romaji")}
                    className={INPUT_CLASS}
                    placeholder="Romaji"
                    disabled={disableInputs}
                  />
                  {personErrors.romaji && (
                    <p className="text-xs text-rose-400">
                      {personErrors.romaji}
                    </p>
                  )}
                </div>

                <Button
                  variant="primary"
                  onMouseDown={() => {
                    const payload: PeopleInsert = {
                      display_name: personData.display_name ?? "",
                      romaji: personData.romaji ?? "",
                      furigana: personData.furigana ?? null,
                      alt_names: null,
                    };

                    addPersonMutation.mutate(payload);
                  }}
                >
                  Add
                </Button>
              </div>
            </dialog>
          </div>

          {/* Credit */}
          <p className="text-xs text-zinc-500">Provide a new credit</p>
          {Credit.CREDIT_ROLE_VALUES.map((role) => {
            return (
              <div key={role}>
                <PeopleSelect
                  formData={formData}
                  role={role}
                  errors={errors}
                  people={people!}
                  isPeopleLoading={isPeopleLoading}
                  isNew={isNew}
                  setFormData={setFormData}
                  setErrors={setErrors}
                  setIsDirty={setIsDirty}
                />
              </div>
            );
          })}
        </div>

        {/* Work */}
        <div className="flex items-center gap-2 pt-2">
          <input
            id="hasWork"
            type="checkbox"
            checked={hasWork}
            onChange={handleHasWorkToggle}
            disabled={disableInputs}
            className="h-4 w-4 accent-teal-500"
          />
          <label
            htmlFor="hasWork"
            className="text-sm font-medium text-zinc-300"
          >
            Link to a work
          </label>
        </div>

        {hasWork && (
          <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">
              Work Details
            </h2>
            <p className="text-xs text-zinc-500">
              Provide a new work or link an existing work ID to associate this
              song.
            </p>

            <div className="grid gap-1">
              <label
                htmlFor="work_id"
                className="text-xs font-semibold uppercase tracking-wide text-zinc-400"
              >
                Existing Work ID
              </label>
              <input
                id="work_id"
                name="work_id"
                type="text"
                value={formData.work_id}
                onChange={handleInputChange("work_id")}
                className={INPUT_CLASS}
                placeholder="UUID from Supabase"
                disabled={disableInputs}
              />
              {errors.work_id && (
                <p className="text-xs text-rose-400">{errors.work_id}</p>
              )}
            </div>

            <div className="grid gap-1">
              <label
                htmlFor="work_title"
                className="text-xs font-semibold uppercase tracking-wide text-zinc-400"
              >
                Work Title
              </label>
              <input
                id="work_title"
                name="work_title"
                type="text"
                value={formData.work_title}
                onChange={handleInputChange("work_title")}
                className={INPUT_CLASS}
                placeholder="Title of the work"
                disabled={disableInputs}
              />
              {errors.work_title && (
                <p className="text-xs text-rose-400">{errors.work_title}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1">
                <label
                  htmlFor="work_romaji"
                  className="text-xs font-semibold uppercase tracking-wide text-zinc-400"
                >
                  Work Romaji
                </label>
                <input
                  id="work_romaji"
                  name="work_romaji"
                  type="text"
                  value={formData.work_romaji}
                  onChange={handleInputChange("work_romaji")}
                  className={INPUT_CLASS}
                  disabled={disableInputs}
                />
              </div>
              <div className="grid gap-1">
                <label
                  htmlFor="work_furigana"
                  className="text-xs font-semibold uppercase tracking-wide text-zinc-400"
                >
                  Work Furigana
                </label>
                <input
                  id="work_furigana"
                  name="work_furigana"
                  type="text"
                  value={formData.work_furigana}
                  onChange={handleInputChange("work_furigana")}
                  className={INPUT_CLASS}
                  disabled={disableInputs}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1">
                <label
                  htmlFor="work_kind"
                  className="text-xs font-semibold uppercase tracking-wide text-zinc-400"
                >
                  Work Kind
                </label>
                <select
                  id="work_kind"
                  name="work_kind"
                  value={formData.work_kind}
                  onChange={handleWorkKindChange}
                  className={`${INPUT_CLASS} pr-8`}
                  disabled={disableInputs}
                >
                  {WORK_KIND_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-1">
                <label
                  htmlFor="work_year"
                  className="text-xs font-semibold uppercase tracking-wide text-zinc-400"
                >
                  Work Year
                </label>
                <input
                  id="work_year"
                  name="work_year"
                  type="text"
                  inputMode="numeric"
                  value={formData.work_year}
                  onChange={handleInputChange("work_year")}
                  className={INPUT_CLASS}
                  disabled={disableInputs}
                />
                {errors.work_year && (
                  <p className="text-xs text-rose-400">{errors.work_year}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Lines */}
        <section className="grid gap-1 pb-15">
          <h2>Lyrics</h2>

          {renderLines &&
            renderLines.map((line, index) => {
              const { lyric, timestamp_sec, id } = line;
              const timestamp = Song.secondsToTimestamp(timestamp_sec);
              const matches = (current: typeof line) =>
                id !== null && id !== undefined
                  ? current.id === id
                  : current.timestamp_sec === timestamp_sec;
              return (
                <div key={id}>
                  <div className="flex gap-x-3">
                    <input
                      type="time"
                      className={`${INPUT_CLASS} w-fit`}
                      value={timestamp ?? ""}
                      onFocus={() => setEditingField("timestamp")}
                      onBlur={() => setEditingField("none")}
                      onChange={(e) => {
                        const newTimestamp = Song.timestampToSeconds(
                          e.target.value
                        );
                        if (Number.isNaN(newTimestamp)) {
                          setErrors((prev) => ({
                            ...prev,
                            lines: "Not a Number",
                          }));
                          console.warn("Not a number", newTimestamp);
                          return;
                        }

                        setFormData((prev) => ({
                          ...prev,
                          lines: prev.lines.map((line) =>
                            matches(line)
                              ? {
                                  ...line,
                                  timestamp_sec: newTimestamp,
                                }
                              : line
                          ),
                        }));

                        setIsDirty(true);
                      }}
                    ></input>
                    <input
                      className={`${INPUT_CLASS} w-full overflow-auto`}
                      value={lyric ?? ""}
                      onChange={(e) => {
                        const nextLyric = e.target.value;

                        setFormData((prev) => ({
                          ...prev,
                          lines: prev.lines.map((line) =>
                            matches(line)
                              ? {
                                  ...line,
                                  lyric: nextLyric,
                                }
                              : line
                          ),
                        }));

                        setIsDirty(true);
                        setErrors({});
                      }}
                    ></input>

                    {/* Controls */}
                    <div className="flex gap-x-1">
                      <Button
                        variant="icon"
                        className="size-7"
                        onClick={() => {
                          //@ts-expect-error we use randomUUID as temporary ID which is string but the db requiers a number
                          setFormData((prev) => {
                            return {
                              ...prev,
                              lines: [
                                ...prev.lines.slice(0, index + 1),
                                {
                                  id: crypto.randomUUID(),
                                  lyric: "",
                                  timestamp_sec: line.timestamp_sec + 1,
                                  song_id: formData.id ?? "",
                                },
                                ...prev.lines.slice(index + 1),
                              ],
                            };
                          });

                          setErrors({});
                        }}
                      >
                        <Plus />
                      </Button>
                      <Button
                        variant="icon"
                        className="bg-red-500 size-7"
                        onClick={() => {
                          if (isNew || typeof line.id === "string") {
                            setFormData((prev) => {
                              return {
                                ...prev,
                                lines: prev.lines.filter(
                                  (line) => line.id !== id
                                ),
                              };
                            });
                            return;
                          }
                          if (!id) {
                            console.warn("No Line Id");
                            return;
                          }

                          deleteLineMutation.mutate(id);
                          setFormData((prev) => {
                            return {
                              ...prev,
                              lines: prev.lines.filter(
                                (line) => line.id !== id
                              ),
                            };
                          });
                          localStorage.setItem(
                            storageKey,
                            JSON.stringify(formData)
                          );

                          setIsDirty(true);
                        }}
                      >
                        <X />
                      </Button>
                    </div>
                  </div>
                  {errors.lines && (
                    <p className="text-xs text-rose-400">{errors.lines}</p>
                  )}
                </div>
              );
            })}

          {/* Bottom Tools */}
          <div className="flex justify-center w-full gap-5">
            <Button
              variant="icon"
              onMouseDown={() => setModal("batchAddLyrics")}
            >
              <FilePlus />
            </Button>
            <Button
              variant="icon"
              onClick={() => {
                if (!song?.id) {
                  toast.error("No Song id");
                  return;
                }
                if (window.confirm("Do you want to Bomb all lines?!")) {
                  deleteAllLinesMutation.mutate(song?.id);
                } else {
                  toast.info("Bomb Cancelled!");
                }
              }}
            >
              <Bomb />
            </Button>
          </div>

          <dialog
            open={modal === "batchAddLyrics"}
            className={`${PANEL_CLASS} text-white space-y-5 p-3 mx-auto w-full max-w-3xl backdrop-blur-2xl fixed top-0 my-9`}
          >
            <textarea
              ref={lyricsTextareaRef}
              name="lyrics"
              id="lyrics"
              className="bg-zinc-400/5 rounded-2xl min-h-72 max-h-svh overflow-y-auto resize-none w-full px-9 py-5"
              onChange={(e) => {
                const el = e.target;
                el.style.height = "auto";
                el.style.height = `${Math.min(
                  el.scrollHeight,
                  window.innerHeight * 0.8
                )}px`;
                const lines = el.value
                  .split("\n\n")
                  .reduce((acc, fields, lineIndex) => {
                    const line = acc[lineIndex] ?? (acc[lineIndex] = {});
                    fields.split("\n").forEach((field, idx) => {
                      switch (idx) {
                        case 0:
                          //@ts-expect-error we use randomUUID as temporary ID which is string but the db requiers a number
                          line["id"] = crypto.randomUUID();
                          line["line_index"] = Number(field);
                          break;
                        case 1:
                          line["timestamp_sec"] = Song.timestampToSeconds(
                            field,
                            { srt: true }
                          );
                          break;
                        case 2:
                          line["lyric"] = field;
                      }
                    });

                    return acc;
                  }, [] as LinesUpdate[]);

                //@ts-expect-error we use randomUUID as temporary ID which is string but the db requiers a number
                setFormData((prev) => {
                  return {
                    ...prev,
                    lines,
                  };
                });

                setIsDirty(true);
              }}
            ></textarea>
            <div className="flex justify-between">
              <p>Batch Add Lyrics</p>
              <Button
                type="button"
                variant="icon"
                onMouseDown={() =>
                  setModal((model) =>
                    model === "batchAddLyrics" ? "idel" : "batchAddLyrics"
                  )
                }
              >
                <X />
              </Button>
            </div>
          </dialog>
        </section>

        {/* Tool bar */}
        <div className="fixed bottom-20 left-5 flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              disabled={
                disableInputs || saveMutation.isPending || (!isDirty && !isNew)
              }
              variant="primary"
            >
              {saveMutation.isPending ? "Saving…" : "Save"}
            </Button>

            {!isNew && (
              <Button
                type="button"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                variant="danger"
              >
                {deleteMutation.isPending ? "Deleting…" : "Delete"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </section>
  );
}
