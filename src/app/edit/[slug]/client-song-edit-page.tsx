"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Credit,
  InsertRow,
  Song,
  SongBundle,
  UpdateRow,
} from "@/data/models/Song";
import { Work, WorkInsert, WorkKind, WorkUpdate } from "@/data/models/Work";
import { QueryKey } from "@/data/query-keys";
import { Song as LegacySong } from "@/songs/Song";
import Loading from "@/app/components/loading";

const NEW_SLUG_SENTINEL = "new";
const PANEL_CLASS =
  "rounded-2xl border border-zinc-800 bg-zinc-950/60 shadow-[0_25px_55px_-40px_rgba(12,12,12,1)]";
const INPUT_CLASS =
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

type SongFormData = {
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
} & Credit;

type FormErrors = Partial<Record<keyof SongFormData | "base", string>>;

type WorkAction =
  | { kind: "none"; work_id: string | null }
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
  initialWork_id: string | null;
  initialWorkSnapshot: WorkFormSnapshot | null;
  hasWork: boolean;
};

type ValidationResult = {
  errors: FormErrors;
  sanitizedSlug: string;
  songInsert?: InsertRow;
  songUpdate?: UpdateRow;
  workAction: WorkAction;
};

function blankSong(): SongFormData {
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
    primary_artist: [],
    featured_artist: [],
    composer: [],
    lyricist: [],
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
  romaji: string;
  sanitizedSlug: string;
  youtubeId: string | null;
  endSeconds: number | null;
  furigana: string;
};

function validateSongSection(
  values: SongFormData,
  errors: FormErrors
): SongSectionResult {
  const name = values.name.trim();
  if (!name) {
    errors.name = "Name is required.";
  }

  const romaji = values.romaji.trim();
  if (!romaji) {
    errors.romaji = "Romaji is required.";
  }

  const sanitizedSlug = Song.toSlug(romaji);
  if (!sanitizedSlug) {
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
    romaji,
    sanitizedSlug,
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
    if (options.initialWork_id) {
      return { kind: "unlink" };
    }
    return { kind: "none", work_id: null };
  }

  const work_id = values.work_id.trim();
  const work_title = values.work_title.trim();
  const work_romaji = values.work_romaji.trim();
  const work_furigana = values.work_furigana.trim();
  const work_yearRaw = values.work_year.trim();

  let work_year: number | null = null;
  if (work_yearRaw.length > 0) {
    const parsedYear = Number(work_yearRaw);
    if (Number.isNaN(parsedYear)) {
      errors.work_year = "Year must be a number.";
    } else {
      work_year = parsedYear;
    }
  }

  const hasDetails =
    work_title.length > 0 ||
    work_romaji.length > 0 ||
    work_furigana.length > 0 ||
    work_yearRaw.length > 0;

  const snapshot = options.initialWorkSnapshot;
  const matchesSnapshot = Boolean(
    snapshot &&
      snapshot.id === work_id &&
      snapshot.title === work_title &&
      snapshot.romaji === work_romaji &&
      snapshot.furigana === work_furigana &&
      snapshot.kind === values.work_kind &&
      snapshot.year === work_yearRaw
  );

  if (work_id.length > 0) {
    if (!hasDetails || matchesSnapshot) {
      return { kind: "none", work_id: toNullable(work_id) };
    }

    if (!work_title) {
      errors.work_title =
        "Work title is required when editing an existing work.";
      return { kind: "none", work_id: toNullable(work_id) };
    }

    return {
      kind: "update",
      id: work_id,
      payload: {
        title: work_title || undefined,
        romaji: work_romaji || null,
        furigana: work_furigana || null,
        kind: values.work_kind,
        year: work_year,
      },
    };
  }

  if (!hasDetails) {
    return { kind: "none", work_id: toNullable(options.initialWork_id) };
  }

  if (!work_title) {
    errors.work_title = "Work title is required.";
    return { kind: "none", work_id: toNullable(options.initialWork_id) };
  }

  return {
    kind: "create",
    payload: {
      title: work_title,
      romaji: work_romaji || null,
      furigana: work_furigana || null,
      kind: values.work_kind,
      year: work_year,
    },
  };
}

function validateForm(
  values: SongFormData,
  options: ValidationOptions
): ValidationResult {
  const errors: FormErrors = {};

  const songSection = validateSongSection(values, errors);
  const workAction = determineWorkAction(values, options, errors);

  if (options.isNew && workAction.kind === "none" && !workAction.work_id) {
    errors.work_title = "Provide a new work or link an existing work ID.";
  }

  if (Object.keys(errors).length > 0 || !songSection.sanitizedSlug) {
    return { errors, sanitizedSlug: songSection.sanitizedSlug, workAction };
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
        ? workAction.work_id ?? null
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
        ? workAction.work_id ?? null
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
  };
}

type SaveInput =
  | { kind: "create"; song: InsertRow; workAction: WorkAction }
  | {
      kind: "update";
      id: string;
      previousSlug: string;
      song: UpdateRow;
      workAction: WorkAction;
    };

export default function ClientSongEditPage({ slug }: { slug: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const isNew = slug === NEW_SLUG_SENTINEL;

  const [formData, setFormData] = useState<SongFormData>(blankSong);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [initialWork_id, setInitialWork_id] = useState<string | null>(null);
  const [initialWorkSnapshot, setInitialWorkSnapshot] =
    useState<WorkFormSnapshot | null>(null);
  const [hasWork, setHasWork] = useState<boolean>(false);

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

  const disableInputs = !isNew && (isLoading || Boolean(fetchError));

  useEffect(() => {
    if (!isNew && song) {
      const mapped = mapRowToForm(song);
      setFormData(mapped);
      setErrors({});
      setIsDirty(false);
      setInitialWork_id(song.work?.id ?? null);
      setHasWork(Boolean(song.work?.id));
      setInitialWorkSnapshot(
        song.work?.id
          ? {
              id: song.work.id,
              title: mapped.work_title,
              romaji: mapped.work_romaji,
              furigana: mapped.work_furigana,
              kind: mapped.work_kind,
              year: mapped.work_year,
            }
          : null
      );
    }
  }, [isNew, song]);

  useEffect(() => {
    if (isNew) {
      const initial = blankSong();
      setFormData(initial);
      setErrors({});
      setIsDirty(false);
      setInitialWork_id(null);
      setHasWork(false);
      setInitialWorkSnapshot(null);
    }
  }, [isNew]);

  const saveMutation = useMutation({
    mutationFn: async (input: SaveInput) => {
      let work_id: string | null = null;

      switch (input.workAction.kind) {
        case "create": {
          if (!hasWork) {
            work_id = null;
            break;
          }
          const created = await Work.create(input.workAction.payload);
          work_id = created.id;
          break;
        }
        case "update": {
          if (hasWork) {
            await Work.update(input.workAction.id, input.workAction.payload);
          }
          work_id = input.workAction.id;
          break;
        }
        case "none": {
          work_id = input.workAction.work_id ?? null;
          break;
        }
        case "unlink":
        default: {
          work_id = null;
        }
      }

      if (input.kind === "create") {
        const created = await Song.insertSong({
          ...input.song,
          work_id: work_id,
        });
        return Song.getBundle(created.slug);
      }

      const updated = await Song.updateSong(input.id, {
        ...input.song,
        work_id: work_id,
      });
      const slugToFetch = updated.slug ?? input.song.slug ?? input.previousSlug;
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

      window.alert("Updated");
    },
    onError: (err: unknown) => {
      const message =
        err instanceof Error ? err.message : "Unable to save the song.";
      setErrors((prev) => ({ ...prev, base: message }));
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
    },
  });

  const handleInputChange =
    (field: keyof SongFormData) =>
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const value = event.target.value;
      setFormData((prev) => {
        if (field === "romaji") {
          const nextSlug = Song.toSlug(value);
          return { ...prev, romaji: value, slug: nextSlug };
        }
        return { ...prev, [field]: value };
      });
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      setIsDirty(true);
    };

  const handleWork_kindChange = (event: ChangeEvent<HTMLSelectElement>) => {
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
      initialWork_id,
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

  if (isLoading) {
    return <Loading isFullScreen />;
  }

  return (
    <section className="w-full max-w-3xl space-y-6 py-8 text-zinc-100 px-3">
      <button
        type="button"
        onClick={() => router.push("/edit")}
        className="text-sm font-medium text-teal-300 transition hover:text-teal-200"
      >
        ← Back to list
      </button>

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
            required
            disabled={disableInputs}
          />
          {errors.romaji && (
            <p className="text-xs text-rose-400">{errors.romaji}</p>
          )}
        </div>

        <div className="grid gap-1">
          <label
            htmlFor="slug"
            className="text-xs font-semibold uppercase tracking-wide text-zinc-400"
          >
            Slug (auto-generated)
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            value={formData.slug}
            readOnly
            className={`${INPUT_CLASS} cursor-not-allowed opacity-70`}
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
                  onChange={handleWork_kindChange}
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

        <div className="flex flex-wrap items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={
              disableInputs || saveMutation.isPending || (!isDirty && !isNew)
            }
            className="rounded bg-teal-500 px-4 py-2 text-sm font-semibold text-white shadow transition enabled:hover:bg-teal-400 enabled:focus-visible:outline enabled:focus-visible:outline-offset-2 enabled:focus-visible:outline-teal-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saveMutation.isPending ? "Saving…" : "Save"}
          </button>

          {!isNew && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="rounded border border-rose-500/60 px-4 py-2 text-sm font-semibold text-rose-300 transition enabled:hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
